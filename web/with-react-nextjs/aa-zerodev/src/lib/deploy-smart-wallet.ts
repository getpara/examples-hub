import type { ParaWeb as Para } from "@getpara/react-sdk";
import { createParaZeroDevClient } from "./create-zerodev-client";
import { publicClient } from "./create-public-viem-client";

export async function deploySmartWallet(para: Para, walletId: string, index: number) {
  const { client, account, address } = await createParaZeroDevClient(para, BigInt(index));

  // Check if already deployed
  const isDeployed = await account.isDeployed();
  
  if (!isDeployed) {
    // Deploy by sending a self-transfer transaction
    const txHash = await client.sendTransaction({
      to: address,
      value: 0n,
      data: "0x"
    });

    // Wait for transaction receipt
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    return {
      address,
      deployTxHash: txHash,
    };
  }

  // If already deployed, just return the address
  return {
    address,
    deployTxHash: null,
  };
}
