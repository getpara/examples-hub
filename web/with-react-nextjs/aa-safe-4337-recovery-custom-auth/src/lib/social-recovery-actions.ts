import {
  BaseError,
  ContractFunctionRevertedError,
  ExecutionRevertedError,
  createWalletClient,
  encodeFunctionData,
  http,
  zeroAddress,
  type Address,
  type Hash,
  type Hex,
  type LocalAccount,
} from "viem";
import { BURN_ADDRESS, CHAIN, SEPOLIA_RPC_URL, SOCIAL_RECOVERY_MODULE_ADDRESS } from "@/lib/safe-recovery";
import { safeAbi, socialRecoveryAbi } from "@/lib/safe-recovery-abi";
import type { Safe4337Client } from "@/lib/safe-4337-client";

function getRecoveryExecuteAfter(request: unknown) {
  if (Array.isArray(request)) return Number(request[2]);
  return Number((request as { executeAfter?: bigint | number }).executeAfter ?? 0);
}

function createGuardianWalletClient(account: LocalAccount) {
  return createWalletClient({
    account,
    chain: CHAIN,
    transport: http(SEPOLIA_RPC_URL),
  });
}

function toSafeEthSignSignature(signature: Hex): Hex {
  const signatureV = Number.parseInt(signature.slice(-2), 16);
  const normalizedV = signatureV < 27 ? signatureV + 27 : signatureV;
  const safeV = (normalizedV + 4).toString(16).padStart(2, "0");
  return `${signature.slice(0, -2)}${safeV}` as Hex;
}

function isOwnerValidationRejection(message: string) {
  return /GS026|owner validation|owner signature|not an owner|invalid owner/i.test(message);
}

export function getSafeOwnerValidationRejection(error: unknown) {
  if (error instanceof BaseError) {
    const revertError = error.walk(
      (cause) =>
        cause instanceof ContractFunctionRevertedError ||
        cause instanceof ExecutionRevertedError,
    );

    if (revertError instanceof ContractFunctionRevertedError) {
      const message = revertError.reason ?? revertError.shortMessage;
      return isOwnerValidationRejection(message) ? message : null;
    }

    if (revertError instanceof ExecutionRevertedError) {
      const message = revertError.details ?? revertError.shortMessage;
      return isOwnerValidationRejection(message) ? message : null;
    }

    if (isOwnerValidationRejection(error.shortMessage)) {
      return error.shortMessage;
    }

    return null;
  }

  if (error instanceof Error && isOwnerValidationRejection(error.message)) {
    return error.message;
  }

  return null;
}

export async function readRecoveryModuleProof({
  safe,
  safeAddress,
  guardianAddress,
}: {
  safe: Safe4337Client;
  safeAddress: Address;
  guardianAddress: Address;
}) {
  const [moduleEnabled, guardianEnabled, guardianThreshold] = await Promise.all([
    safe.publicClient.readContract({
      address: safeAddress,
      abi: safeAbi,
      functionName: "isModuleEnabled",
      args: [SOCIAL_RECOVERY_MODULE_ADDRESS],
    }),
    safe.publicClient.readContract({
      address: SOCIAL_RECOVERY_MODULE_ADDRESS,
      abi: socialRecoveryAbi,
      functionName: "isGuardian",
      args: [safeAddress, guardianAddress],
    }),
    safe.publicClient.readContract({
      address: SOCIAL_RECOVERY_MODULE_ADDRESS,
      abi: socialRecoveryAbi,
      functionName: "threshold",
      args: [safeAddress],
    }),
  ]);

  return `Module enabled: ${moduleEnabled ? "yes" : "no"}; guardian registered: ${
    guardianEnabled ? "yes" : "no"
  }; threshold: ${guardianThreshold.toString()}.`;
}

export async function simulateParaSignedOwnerSpendAttempt({
  safe,
  safeAddress,
  guardianAccount,
}: {
  safe: Safe4337Client;
  safeAddress: Address;
  guardianAccount: LocalAccount;
}) {
  const nonce = await safe.publicClient.readContract({
    address: safeAddress,
    abi: safeAbi,
    functionName: "nonce",
  });

  const safeTxHash = await safe.publicClient.readContract({
    address: safeAddress,
    abi: safeAbi,
    functionName: "getTransactionHash",
    args: [
      BURN_ADDRESS,
      BigInt(0),
      "0x",
      0,
      BigInt(0),
      BigInt(0),
      BigInt(0),
      zeroAddress,
      zeroAddress,
      nonce,
    ],
  });
  const guardianSignature = await guardianAccount.signMessage({ message: { raw: safeTxHash } });
  const safeSignature = toSafeEthSignSignature(guardianSignature);

  await safe.publicClient.call({
    account: guardianAccount.address,
    to: safeAddress,
    data: encodeFunctionData({
      abi: safeAbi,
      functionName: "execTransaction",
      args: [
        BURN_ADDRESS,
        BigInt(0),
        "0x",
        0,
        BigInt(0),
        BigInt(0),
        BigInt(0),
        zeroAddress,
        zeroAddress,
        safeSignature,
      ],
    }),
  });
}

export async function confirmRecoveryWithGuardian({
  safe,
  guardianAccount,
  safeAddress,
  newOwnerAddress,
}: {
  safe: Safe4337Client;
  guardianAccount: LocalAccount;
  safeAddress: Address;
  newOwnerAddress: Address;
}): Promise<{ hash: Hash; executeAfter: number }> {
  const walletClient = createGuardianWalletClient(guardianAccount);
  const hash = await walletClient.writeContract({
    account: guardianAccount,
    address: SOCIAL_RECOVERY_MODULE_ADDRESS,
    abi: socialRecoveryAbi,
    functionName: "confirmRecovery",
    args: [safeAddress, [newOwnerAddress], BigInt(1), true],
  });

  await safe.publicClient.waitForTransactionReceipt({ hash });
  const request = await safe.publicClient.readContract({
    address: SOCIAL_RECOVERY_MODULE_ADDRESS,
    abi: socialRecoveryAbi,
    functionName: "getRecoveryRequest",
    args: [safeAddress],
  });

  return { hash, executeAfter: getRecoveryExecuteAfter(request) };
}

export async function finalizeRecoveryWithGuardian({
  safe,
  guardianAccount,
  safeAddress,
}: {
  safe: Safe4337Client;
  guardianAccount: LocalAccount;
  safeAddress: Address;
}) {
  const walletClient = createGuardianWalletClient(guardianAccount);
  const hash = await walletClient.writeContract({
    account: guardianAccount,
    address: SOCIAL_RECOVERY_MODULE_ADDRESS,
    abi: socialRecoveryAbi,
    functionName: "finalizeRecovery",
    args: [safeAddress],
  });

  await safe.publicClient.waitForTransactionReceipt({ hash });
  return hash;
}
