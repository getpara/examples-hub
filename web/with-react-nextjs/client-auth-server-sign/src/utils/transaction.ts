import { type JsonRpcProvider, parseEther, formatEther, toBigInt, type TransactionRequest } from "ethers";

export async function calculateTotalCost(
  provider: JsonRpcProvider,
  ethAmount: string
): Promise<{ totalCost: bigint; gasFee: bigint }> {
  const feeData = await provider.getFeeData();
  const gasLimit = toBigInt(21000); // Standard ETH transfer gas limit
  const maxGasFee = gasLimit * (feeData.maxFeePerGas ?? toBigInt(0));
  const amountWei = parseEther(ethAmount);
  const totalCost = amountWei + maxGasFee;

  return { totalCost, gasFee: maxGasFee };
}

export async function constructTransaction(
  provider: JsonRpcProvider,
  from: string,
  to: string,
  ethAmount: string
): Promise<TransactionRequest> {
  const nonce = await provider.getTransactionCount(from);
  const feeData = await provider.getFeeData();
  const gasLimit = toBigInt(21000);
  const value = parseEther(ethAmount);

  const tx: TransactionRequest = {
    to,
    value,
    nonce,
    gasLimit,
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    chainId: 11155111, // Sepolia
  };

  return tx;
}

export async function validateTransaction(
  provider: JsonRpcProvider,
  from: string,
  to: string,
  ethAmount: string
): Promise<{ isValid: boolean; error?: string }> {
  try {
    const balanceWei = await provider.getBalance(from);
    const { totalCost } = await calculateTotalCost(provider, ethAmount);

    if (totalCost > balanceWei) {
      const requiredEth = formatEther(totalCost);
      const availableEth = formatEther(balanceWei);
      return {
        isValid: false,
        error: `Insufficient balance. Transaction requires approximately ${requiredEth} ETH (including max gas fees), but only ${availableEth} ETH is available.`
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Transaction validation failed"
    };
  }
}

export function serializeTransaction(tx: TransactionRequest): string {
  return JSON.stringify(tx, (_, value) => 
    typeof value === "bigint" ? value.toString() : value
  );
}