import type { ParaWeb as Para } from "@getpara/react-sdk";
import { createParaThirdwebClient } from "./create-thirdweb-client";
import { publicClient } from "./create-public-viem-client";
import { sendTransaction, prepareTransaction, getContract } from "thirdweb";
import { isContractDeployed } from "thirdweb/utils";
import { thirdwebClient, CHAIN } from "@/config/thirdweb";

export async function deploySmartWallet(para: Para, walletId: string, index: number) {
  const { account, address } = await createParaThirdwebClient(para, BigInt(index));

  // Create a contract instance for the smart wallet address
  const contract = getContract({
    client: thirdwebClient,
    chain: CHAIN,
    address: address,
  });

  // Check if the smart wallet is already deployed
  const isDeployed = await isContractDeployed(contract);

  if (!isDeployed) {
    // Deploy by sending a self-transfer transaction
    const transaction = prepareTransaction({
      to: address,
      value: BigInt(0),
      data: "0x",
      chain: CHAIN,
      client: thirdwebClient,
    });

    const result = await sendTransaction({
      account,
      transaction,
    });

    await publicClient.waitForTransactionReceipt({ hash: result.transactionHash });

    return {
      address,
      deployTxHash: result.transactionHash,
    };
  }

  // If already deployed, just return the address
  return {
    address,
    deployTxHash: null,
  };
}
