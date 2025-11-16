import type { ParaWeb as Para } from "@getpara/react-sdk";
import { getGelatoClient } from "./create-gelato-client";
import { sponsored } from "@gelatonetwork/smartwallet";
import { GELATO_API_KEY } from "@/config/gelato";

export async function deploySmartWallet(para: Para, walletId: string, index: number) {
  const { client, address, publicClient } = await getGelatoClient(para, BigInt(index));

  // Check if deployed by fetching bytecode
  const bytecode = await publicClient.getCode({ address: address as `0x${string}` });
  const isDeployed = bytecode !== "0x" && bytecode !== undefined;

  if (!isDeployed) {
    // Deploy with empty transaction and gas sponsorship
    console.log(`[deploySmartWallet] Deploying smart wallet at address: ${address}`);
    
    const response = await client.execute({
      payment: sponsored(GELATO_API_KEY),
      calls: [], // Empty calls to deploy the account
    });

    console.log(`[deploySmartWallet] UserOp ID: ${response?.id}`);

    // Wait for the transaction to be mined with timeout
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Deployment timeout after 60 seconds")), 60000);
      });
      
      // Race between the deployment and timeout
      const txHash = await Promise.race([
        response?.wait(),
        timeoutPromise
      ]);
      
      console.log(`[deploySmartWallet] Transaction hash: ${txHash}`);
      
      return {
        address,
        deployTxHash: txHash || null,
      };
    } catch (error) {
      console.error(`[deploySmartWallet] Error waiting for deployment:`, error);
      
      // If it's a timeout, return with the address but no txHash
      if (error instanceof Error && error.message.includes("timeout")) {
        console.log(`[deploySmartWallet] Timeout reached, returning address without txHash`);
        return {
          address,
          deployTxHash: null,
        };
      }
      
      throw error;
    }
  }

  return {
    address,
    deployTxHash: null,
  };
}