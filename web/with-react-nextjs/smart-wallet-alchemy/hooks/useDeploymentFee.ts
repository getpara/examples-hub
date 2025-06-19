import { useQuery } from "@tanstack/react-query";
import { formatEther } from "viem";
import { publicClient } from "@/lib/viem-client";
import { createParaAlchemyClient, generateSalt } from "@/lib/smart-wallet/core";
import { useClient } from "@getpara/react-sdk";
import { useEthPrice } from "./useEthPrice";

interface DeploymentFee {
  ethAmount: string;
  usdAmount: string;
  isSponsored: boolean;
  gasUnits: bigint;
  gasPrice: bigint;
}

export function useDeploymentFee(walletId: string | null, index: number) {
  const para = useClient();
  const { priceUsd } = useEthPrice();

  return useQuery<DeploymentFee>({
    queryKey: ["deploymentFee", walletId, index],
    queryFn: async () => {
      if (!para || !walletId) {
        throw new Error("Para client or wallet ID not available");
      }

      try {
        // Create the Alchemy client for gas estimation
        const salt = generateSalt(walletId, index);
        const client = await createParaAlchemyClient(para, salt);

        // Build a deployment user operation
        const deploymentOp = await client.buildUserOperation({
          uo: {
            target: client.account.address,
            data: "0x",
            value: BigInt(0),
          },
        });

        // Get current gas price from the network
        const gasPrice = await publicClient.getGasPrice();

        // Calculate total gas units (including all UserOp gas fields)
        const totalGasUnits =
          BigInt(deploymentOp.callGasLimit) +
          BigInt(deploymentOp.verificationGasLimit) +
          BigInt(deploymentOp.preVerificationGas);

        // Calculate the actual gas cost
        const gasCost = totalGasUnits * gasPrice;

        // Check if gas is sponsored (cost would be 0)
        const isSponsored = deploymentOp.paymasterAndData !== "0x";

        // Format ETH amount
        const ethAmount = formatEther(isSponsored ? BigInt(0) : gasCost);

        // Calculate USD amount
        const usdAmount = priceUsd ? (parseFloat(ethAmount) * priceUsd).toFixed(2) : "0.00";

        return {
          ethAmount,
          usdAmount,
          isSponsored,
          gasUnits: totalGasUnits,
          gasPrice,
        };
      } catch (error) {
        console.error("Error estimating deployment fee:", error);
        // Return default values on error
        return {
          ethAmount: "0",
          usdAmount: "0",
          isSponsored: true,
          gasUnits: BigInt(0),
          gasPrice: BigInt(0),
        };
      }
    },
    enabled: !!para && !!walletId && index >= 0,
    staleTime: 60 * 1000, // 60 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
