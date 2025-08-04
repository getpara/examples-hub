import type { ParaWeb as Para } from "@getpara/react-sdk";
import { createParaThirdwebClient } from "./create-thirdweb-client";
import { sendTransaction, prepareTransaction, getContract, waitForReceipt } from "thirdweb";
import { isContractDeployed } from "thirdweb/utils";
import { CHAIN } from "@/config/thirdweb";
import { thirdwebClient } from "@/lib/thirdweb-client";

export async function deploySmartWallet(para: Para, walletId: string, index: number) {
  console.log("Starting smart wallet deployment...");
  const { account, address } = await createParaThirdwebClient(para, BigInt(index));
  console.log(`Created Para Thirdweb client. Address: ${address}`);

  // Create a contract instance for the smart wallet address
  const contract = getContract({
    client: thirdwebClient,
    chain: CHAIN,
    address: address,
  });
  console.log("Contract instance created.");

  // Check if the smart wallet is already deployed
  const isDeployed = await isContractDeployed(contract);
  console.log(`Is contract deployed? ${isDeployed}`);

  if (!isDeployed) {
    console.log("Contract not deployed. Deploying now...");
    // Deploy by sending a self-transfer transaction
    const transaction = prepareTransaction({
      to: address,
      value: BigInt(0),
      data: "0x",
      chain: CHAIN,
      client: thirdwebClient,
    });
    console.log("Prepared deployment transaction.");

    const result = await sendTransaction({
      account,
      transaction,
    });
    console.log(`Transaction sent. Hash: ${result.transactionHash}`);

    await waitForReceipt({
      client: thirdwebClient,
      chain: CHAIN,
      transactionHash: result.transactionHash,
    });
    console.log("Transaction confirmed.");

    return {
      address,
      deployTxHash: result.transactionHash,
    };
  }

  // If already deployed, just return the address
  console.log("Contract already deployed. Returning address.");
  return {
    address,
    deployTxHash: null,
  };
}
