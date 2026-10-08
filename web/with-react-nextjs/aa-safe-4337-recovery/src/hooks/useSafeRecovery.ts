import { useCallback, useRef, useState } from "react";
import { encodeFunctionData, type LocalAccount } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { SEPOLIA } from "@/lib/chain";
import { createSafe4337Client, type Safe4337Client } from "@/lib/safe4337Client";
import { safeAbi, socialRecoveryAbi } from "@/lib/safeRecoveryAbi";
import { initialState, type RecoveryAction, type RecoveryDemoState } from "@/lib/safeRecoveryState";
import {
  BURN_ADDRESS,
  GUARDIAN_THRESHOLD,
  PIMLICO_API_KEY,
  SOCIAL_RECOVERY_MODULE_ADDRESS,
} from "@/lib/safeRecovery";
import {
  confirmRecoveryWithGuardian,
  finalizeRecoveryWithGuardian,
  getSafeOwnerValidationRejection,
  readRecoveryModuleProof,
  simulateParaSignedOwnerSpendAttempt,
} from "@/lib/socialRecoveryActions";

interface UseSafeRecoveryOptions {
  guardianAccount: LocalAccount | null;
  requestFaucet: () => Promise<string>;
}

export function useSafeRecovery({ guardianAccount, requestFaucet }: UseSafeRecoveryOptions) {
  const [state, setState] = useState<RecoveryDemoState>(initialState);
  const safeRef = useRef<Safe4337Client | null>(null);
  const newOwnerRef = useRef<LocalAccount | null>(null);

  const runAction = useCallback(async (action: RecoveryAction, status: string, run: () => Promise<void>) => {
    setState((current) => ({ ...current, activeAction: action, status, error: null }));
    try {
      await run();
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error instanceof Error ? error : new Error(`${status} failed.`),
      }));
    } finally {
      setState((current) => ({ ...current, activeAction: null, status: null }));
    }
  }, []);

  const createSafe = useCallback(async () => {
    await runAction("create", "Creating and deploying the Safe", async () => {
      if (!PIMLICO_API_KEY) throw new Error("NEXT_PUBLIC_PIMLICO_API_KEY is required.");

      const owner = privateKeyToAccount(generatePrivateKey());
      const newOwner = privateKeyToAccount(generatePrivateKey());
      const safe = await createSafe4337Client({
        owner,
        chain: SEPOLIA.chain,
        rpcUrl: SEPOLIA.rpcUrl,
        pimlicoApiKey: PIMLICO_API_KEY,
      });

      safeRef.current = safe;
      newOwnerRef.current = newOwner;

      setState({
        ...initialState,
        safeAddress: safe.address,
        ownerAddress: owner.address,
        newOwnerAddress: newOwner.address,
        activeAction: "create",
        status: "Deploying the Safe with its first sponsored user operation",
      });

      const receipt = await safe.sendTransaction({ to: BURN_ADDRESS, value: BigInt(0) });
      setState((current) => ({ ...current, createTxHash: receipt.transactionHash }));
    });
  }, [runAction]);

  const protectSafe = useCallback(async () => {
    await runAction("protect", "Enabling the recovery module", async () => {
      const safe = safeRef.current;
      if (!safe || !state.safeAddress || !guardianAccount) {
        throw new Error("Create the Safe and connect an EVM Para wallet first.");
      }

      const guardianAddress = guardianAccount.address;
      const receipt = await safe.sendBatchTransaction([
        {
          to: state.safeAddress,
          data: encodeFunctionData({
            abi: safeAbi,
            functionName: "enableModule",
            args: [SOCIAL_RECOVERY_MODULE_ADDRESS],
          }),
        },
        {
          to: SOCIAL_RECOVERY_MODULE_ADDRESS,
          data: encodeFunctionData({
            abi: socialRecoveryAbi,
            functionName: "addGuardianWithThreshold",
            args: [guardianAddress, GUARDIAN_THRESHOLD],
          }),
        },
      ]);

      const moduleProof = await readRecoveryModuleProof({ safe, safeAddress: state.safeAddress, guardianAddress });

      setState((current) => ({
        ...current,
        protectUserOpHash: receipt.transactionHash,
        moduleProof,
      }));
    });
  }, [runAction, state.safeAddress, guardianAccount]);

  const requestGuardianFunds = useCallback(async () => {
    await runAction("fund", "Requesting faucet funds", async () => {
      const transactionHash = await requestFaucet();
      setState((current) => ({ ...current, faucetTxHash: transactionHash }));
    });
  }, [requestFaucet, runAction]);

  const sendOwnerTransaction = useCallback(async () => {
    await runAction("use", "Sending the owner-signed transaction", async () => {
      const safe = safeRef.current;
      if (!safe) throw new Error("Safe client is not ready.");
      const receipt = await safe.sendTransaction({ to: BURN_ADDRESS, value: BigInt(0) });
      setState((current) => ({ ...current, normalTxHash: receipt.transactionHash }));
    });
  }, [runAction]);

  const proveGuardianCannotSpend = useCallback(async () => {
    await runAction("prove", "Simulating a guardian spend attempt", async () => {
      const safe = safeRef.current;
      if (!safe || !state.safeAddress || !guardianAccount) {
        throw new Error("Enable the recovery guardian before running the negative proof.");
      }

      try {
        await simulateParaSignedOwnerSpendAttempt({
          safe,
          safeAddress: state.safeAddress,
          guardianAccount,
        });
        setState((current) => ({
          ...current,
          negativeProof: "Unexpectedly, the Para-signed Safe transaction simulation did not revert.",
          negativeProofStatus: "error",
        }));
      } catch (error) {
        const reason = error instanceof Error ? getSafeOwnerValidationRejection(error) : null;
        if (!reason) {
          throw error instanceof Error
            ? error
            : new Error("Signed Safe transaction simulation failed before Safe validation.");
        }

        setState((current) => ({
          ...current,
          negativeProof: `Safe rejected the Para-signed transaction during owner validation: ${reason}`,
          negativeProofStatus: "success",
        }));
      }
    });
  }, [runAction, state.safeAddress, guardianAccount]);

  const startRecovery = useCallback(async () => {
    await runAction("start", "Starting recovery with the Para guardian", async () => {
      const safe = safeRef.current;
      if (!safe || !state.safeAddress || !state.newOwnerAddress || !guardianAccount) {
        throw new Error("Safe, replacement owner, and Para guardian must be ready.");
      }

      const recovery = await confirmRecoveryWithGuardian({
        safe,
        guardianAccount,
        safeAddress: state.safeAddress,
        newOwnerAddress: state.newOwnerAddress,
      });

      setState((current) => ({
        ...current,
        recoveryTxHash: recovery.hash,
        cancelTxHash: null,
        finalizeTxHash: null,
        postRecoveryTxHash: null,
        recoveryExecuteAfter: recovery.executeAfter,
      }));
    });
  }, [runAction, state.newOwnerAddress, state.safeAddress, guardianAccount]);

  const vetoRecovery = useCallback(async () => {
    await runAction("veto", "Vetoing recovery with the current owner", async () => {
      const safe = safeRef.current;
      if (!safe) throw new Error("Safe client is not ready.");
      const receipt = await safe.sendTransaction({
        to: SOCIAL_RECOVERY_MODULE_ADDRESS,
        data: encodeFunctionData({ abi: socialRecoveryAbi, functionName: "cancelRecovery" }),
      });

      setState((current) => ({ ...current, cancelTxHash: receipt.transactionHash, recoveryExecuteAfter: null }));
    });
  }, [runAction]);

  const finalizeRecovery = useCallback(async () => {
    await runAction("finalize", "Finalizing recovery", async () => {
      const safe = safeRef.current;
      const newOwner = newOwnerRef.current;
      if (!safe || !state.safeAddress || !newOwner || !guardianAccount) {
        throw new Error("Recovery cannot be finalized until the Safe and Para guardian are ready.");
      }

      const finalizeHash = await finalizeRecoveryWithGuardian({
        safe,
        guardianAccount,
        safeAddress: state.safeAddress,
      });

      const recoveredSafe = await createSafe4337Client({
        owner: newOwner,
        chain: SEPOLIA.chain,
        rpcUrl: SEPOLIA.rpcUrl,
        pimlicoApiKey: PIMLICO_API_KEY,
        safeAddress: state.safeAddress,
      });
      safeRef.current = recoveredSafe;

      const postRecoveryReceipt = await recoveredSafe.sendTransaction({ to: BURN_ADDRESS, value: BigInt(0) });
      setState((current) => ({
        ...current,
        ownerAddress: newOwner.address,
        finalizeTxHash: finalizeHash,
        postRecoveryTxHash: postRecoveryReceipt.transactionHash,
        recoveryExecuteAfter: null,
      }));
    });
  }, [runAction, state.safeAddress, guardianAccount]);

  return {
    ...state,
    createSafe,
    protectSafe,
    requestGuardianFunds,
    sendOwnerTransaction,
    proveGuardianCannotSpend,
    startRecovery,
    vetoRecovery,
    finalizeRecovery,
  };
}
