import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParaViemAccount } from "@getpara/react-core/evm/viem";
import { useRequestFaucet } from "@getpara/react-sdk";
import { encodeFunctionData, type LocalAccount } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { initialState, toError, type RecoveryDemoState } from "@/hooks/safeRecoveryState";
import { createSafe4337Client, type Safe4337Client } from "@/lib/safe-4337-client";
import { safeAbi, socialRecoveryAbi } from "@/lib/safe-recovery-abi";
import {
  confirmRecoveryWithGuardian,
  finalizeRecoveryWithGuardian,
  getSafeOwnerValidationRejection,
  readRecoveryModuleProof,
  simulateParaSignedOwnerSpendAttempt,
} from "@/lib/social-recovery-actions";
import {
  BURN_ADDRESS,
  CHAIN,
  RECOVERY_PERIOD_SECONDS,
  SAFE_VERSION,
  SEPOLIA_RPC_URL,
  SOCIAL_RECOVERY_MODULE_ADDRESS,
  PIMLICO_API_KEY,
} from "@/lib/safe-recovery";

interface UseSafeRecoveryDemoOptions {
  enabled?: boolean;
}

export function useSafeRecoveryDemo({ enabled = true }: UseSafeRecoveryDemoOptions = {}) {
  const [state, setState] = useState<RecoveryDemoState>(initialState);
  const [now, setNow] = useState(() => Date.now());
  const safeRef = useRef<Safe4337Client | null>(null);
  const newOwnerRef = useRef<LocalAccount | null>(null);
  const { viemAccount, isLoading: isGuardianAccountLoading } = useParaViemAccount();
  const { requestFaucetAsync, isPending: isFaucetPending } = useRequestFaucet();

  useEffect(() => {
    if (!state.recoveryExecuteAfter || state.cancelTxHash || state.finalizeTxHash) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [state.cancelTxHash, state.finalizeTxHash, state.recoveryExecuteAfter]);

  const remainingSeconds = state.recoveryExecuteAfter
    ? Math.max(state.recoveryExecuteAfter - Math.floor(now / 1000), 0)
    : 0;
  const canFinalizeRecovery = Boolean(state.recoveryTxHash) && !state.cancelTxHash && remainingSeconds === 0;

  const runAction = useCallback(async (status: string, action: () => Promise<void>) => {
    setState((current) => ({ ...current, status, error: null, isWorking: true }));
    try {
      await action();
    } catch (error) {
      setState((current) => ({ ...current, error: toError(error, `${status} failed.`) }));
    } finally {
      setState((current) => ({ ...current, status: null, isWorking: false }));
    }
  }, []);

  const createSafe = useCallback(async () => {
    await runAction("Creating and deploying the Safe", async () => {
      if (!PIMLICO_API_KEY) throw new Error("NEXT_PUBLIC_PIMLICO_API_KEY is required.");

      const owner = privateKeyToAccount(generatePrivateKey());
      const newOwner = privateKeyToAccount(generatePrivateKey());
      const safe = await createSafe4337Client({
        owner,
        chain: CHAIN,
        rpcUrl: SEPOLIA_RPC_URL,
        pimlicoApiKey: PIMLICO_API_KEY,
      });

      safeRef.current = safe;
      newOwnerRef.current = newOwner;

      setState({
        ...initialState,
        safeAddress: safe.address,
        ownerAddress: owner.address,
        newOwnerAddress: newOwner.address,
        status: "Deploying Safe with the first sponsored UserOp",
        isWorking: true,
      });

      const receipt = await safe.sendTransaction({ to: BURN_ADDRESS, value: BigInt(0) });
      setState((current) => ({ ...current, createTxHash: receipt.transactionHash }));
    });
  }, [runAction]);

  const protectSafe = useCallback(async () => {
    await runAction("Enabling recovery module", async () => {
      const safe = safeRef.current;
      if (!safe || !state.safeAddress || !viemAccount?.address) {
        throw new Error("Create the Safe and connect an EVM Para wallet first.");
      }

      const guardianAddress = viemAccount.address;
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
            args: [guardianAddress, BigInt(1)],
          }),
        },
      ]);

      const moduleProof = await readRecoveryModuleProof({ safe, safeAddress: state.safeAddress, guardianAddress });

      setState((current) => ({
        ...current,
        guardianAddress,
        protectUserOpHash: receipt.transactionHash,
        moduleProof,
      }));
    });
  }, [runAction, state.safeAddress, viemAccount?.address]);

  const requestGuardianFunds = useCallback(async () => {
    await runAction("Requesting faucet funds", async () => {
      const response = await requestFaucetAsync({ chain: "ETHEREUM_SEPOLIA" });
      setState((current) => ({ ...current, faucetTxHash: response.transactionHash }));
    });
  }, [requestFaucetAsync, runAction]);

  const sendNormalTransaction = useCallback(async () => {
    await runAction("Sending owner-signed transaction", async () => {
      const safe = safeRef.current;
      if (!safe) throw new Error("Safe client is not ready.");
      const receipt = await safe.sendTransaction({ to: BURN_ADDRESS, value: BigInt(0) });
      setState((current) => ({ ...current, normalTxHash: receipt.transactionHash }));
    });
  }, [runAction]);

  const proveGuardianCannotSpend = useCallback(async () => {
    await runAction("Simulating guardian spend attempt", async () => {
      const safe = safeRef.current;
      if (!safe || !state.safeAddress || !viemAccount?.address) {
        throw new Error("Enable the recovery guardian before running the negative proof.");
      }

      try {
        await simulateParaSignedOwnerSpendAttempt({
          safe,
          safeAddress: state.safeAddress,
          guardianAccount: viemAccount,
        });
        setState((current) => ({
          ...current,
          negativeProof: "Unexpectedly, the Para-signed Safe transaction simulation did not revert.",
          negativeProofStatus: "error",
        }));
      } catch (error) {
        const reason = getSafeOwnerValidationRejection(error);
        if (!reason) {
          throw toError(error, "Signed Safe transaction simulation failed before Safe validation.");
        }

        setState((current) => ({
          ...current,
          negativeProof: `Safe rejected the Para-signed transaction during owner validation: ${reason}`,
          negativeProofStatus: "success",
        }));
      }
    });
  }, [runAction, state.safeAddress, viemAccount?.address]);

  const startRecovery = useCallback(async () => {
    await runAction("Starting recovery with Para guardian", async () => {
      const safe = safeRef.current;
      if (!safe || !state.safeAddress || !state.newOwnerAddress || !viemAccount) {
        throw new Error("Safe, replacement owner, and Para guardian must be ready.");
      }

      const recovery = await confirmRecoveryWithGuardian({
        safe,
        guardianAccount: viemAccount,
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
  }, [runAction, state.newOwnerAddress, state.safeAddress, viemAccount]);

  const cancelRecovery = useCallback(async () => {
    await runAction("Canceling recovery with current owner", async () => {
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
    await runAction("Finalizing recovery", async () => {
      const safe = safeRef.current;
      const newOwner = newOwnerRef.current;
      if (!safe || !state.safeAddress || !newOwner || !viemAccount) {
        throw new Error("Recovery cannot be finalized until the Safe and Para guardian are ready.");
      }

      const finalizeHash = await finalizeRecoveryWithGuardian({
        safe,
        guardianAccount: viemAccount,
        safeAddress: state.safeAddress,
      });

      const recoveredSafe = await createSafe4337Client({
        owner: newOwner,
        chain: CHAIN,
        rpcUrl: SEPOLIA_RPC_URL,
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
  }, [runAction, state.safeAddress, viemAccount]);

  return useMemo(
    () => ({
      ...state,
      chainName: CHAIN.name,
      burnAddress: BURN_ADDRESS,
      safeVersion: SAFE_VERSION,
      recoveryModuleAddress: SOCIAL_RECOVERY_MODULE_ADDRESS,
      recoveryPeriodSeconds: RECOVERY_PERIOD_SECONDS,
      remainingSeconds,
      guardianFundingMessage: state.protectUserOpHash && !state.faucetTxHash && !state.recoveryTxHash
        ? "Request faucet funds for the Para guardian before starting recovery. The recovery and finalize calls are raw guardian transactions, so the guardian needs Sepolia ETH."
        : null,
      isFaucetPending,
      isGuardianAccountLoading,
      canCreateSafe: enabled && !state.isWorking,
      canProtectSafe: enabled && !state.isWorking && Boolean(state.safeAddress && state.createTxHash && viemAccount?.address),
      canRequestFunds: enabled && !state.isWorking && Boolean(viemAccount?.address) && !isFaucetPending,
      canSendNormalTransaction: enabled && !state.isWorking && Boolean(state.protectUserOpHash),
      canProveGuardianCannotSpend: enabled && !state.isWorking && Boolean(state.protectUserOpHash && viemAccount?.address),
      canStartRecovery: enabled && !state.isWorking && Boolean(state.protectUserOpHash && state.newOwnerAddress && state.faucetTxHash && !state.recoveryTxHash),
      canCancelRecovery: enabled && !state.isWorking && Boolean(state.recoveryTxHash && !state.cancelTxHash && !state.finalizeTxHash),
      canFinalizeRecovery: enabled && !state.isWorking && canFinalizeRecovery,
      createSafe,
      protectSafe,
      requestGuardianFunds,
      sendNormalTransaction,
      proveGuardianCannotSpend,
      startRecovery,
      cancelRecovery,
      finalizeRecovery,
    }),
    [
      canFinalizeRecovery,
      cancelRecovery,
      createSafe,
      enabled,
      finalizeRecovery,
      isFaucetPending,
      isGuardianAccountLoading,
      protectSafe,
      proveGuardianCannotSpend,
      remainingSeconds,
      requestGuardianFunds,
      sendNormalTransaction,
      startRecovery,
      state,
      viemAccount?.address,
    ],
  );
}
