import type { ParaWeb as Para } from "@getpara/react-sdk";
import { createParaZeroDevClient } from "./create-zerodev-client";
import { publicClient } from "./create-public-viem-client";

export async function deploySmartWallet(para: Para, walletId: string, index: number) {
  const { client, account, address } = await createParaZeroDevClient(para, BigInt(index));

  const isDeployed = await account.isDeployed();

  if (!isDeployed) {
    const txHash = await client.sendTransaction({
      to: address,
      value: BigInt(0),
      data: "0x",
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    return {
      address,
      deployTxHash: txHash,
    };
  }

  return {
    address,
    deployTxHash: null,
  };
}
