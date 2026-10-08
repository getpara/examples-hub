import { formatEther, parseEther, type JsonRpcProvider, type TransactionRequest } from "ethers";
import { SEPOLIA } from "@/lib/chain";

const TRANSFER_GAS_LIMIT = BigInt(21000);

export function validateTransferInput(to: string, amount: string) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(to)) {
    throw new Error("Invalid recipient address format.");
  }

  const amountValue = parseFloat(amount);

  if (isNaN(amountValue) || amountValue <= 0) {
    throw new Error("Please enter a valid amount greater than 0.");
  }
}

export async function buildTransferTransaction(
  provider: JsonRpcProvider,
  from: string,
  to: string,
  amount: string
): Promise<TransactionRequest> {
  const [balance, feeData, nonce] = await Promise.all([
    provider.getBalance(from),
    provider.getFeeData(),
    provider.getTransactionCount(from),
  ]);
  const value = parseEther(amount);
  const totalCost = value + TRANSFER_GAS_LIMIT * (feeData.maxFeePerGas ?? BigInt(0));

  if (totalCost > balance) {
    throw new Error(
      `Insufficient balance. Transaction requires approximately ${formatEther(totalCost)} ETH (including max gas fees), but only ${formatEther(balance)} ETH is available.`
    );
  }

  return {
    to,
    value,
    nonce,
    gasLimit: TRANSFER_GAS_LIMIT,
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    chainId: SEPOLIA.chainId,
  };
}

export function serializeTransaction(transaction: TransactionRequest) {
  return JSON.stringify(transaction, (_, value) => (typeof value === "bigint" ? value.toString() : value));
}
