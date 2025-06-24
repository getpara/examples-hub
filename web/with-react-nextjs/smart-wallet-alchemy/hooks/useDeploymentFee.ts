import { useQuery } from "@tanstack/react-query";
import { formatEther, parseEther } from "viem";
import { publicClient } from "@/lib/viem-client";
import { createParaAlchemyClient, generateSalt } from "@/lib/smart-wallet/core";
import { useClient } from "@getpara/react-sdk";
import { useEthPrice } from "./useEthPrice";
import { weiToUsd } from "./useBalance";

export interface DeploymentFee {
  ethAmount: string;
  usdAmount: string;
  isSponsored: boolean;
}

const GAS_POLICY_ID = process.env.NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID || "";

export function useDeploymentFee(walletId: string | null, index: number) {
  const para = useClient();
  const { priceUsd } = useEthPrice();

  const query = useQuery<DeploymentFee | undefined>({
    queryKey: ["deploymentFee", walletId, index],
    queryFn: async () => {
      // Early exit if sponsored
      if (GAS_POLICY_ID) {
        return {
          ethAmount: "0",
          usdAmount: "0",
          isSponsored: true,
        };
      }

      if (!para || !walletId || index < 0) {
        throw new Error("Invalid parameters for deployment fee calculation");
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
          BigInt(deploymentOp.callGasLimit || 0) +
          BigInt(deploymentOp.verificationGasLimit || 0) +
          BigInt(deploymentOp.preVerificationGas || 0);

        // Calculate the actual gas cost
        const gasCost = totalGasUnits * gasPrice;

        // Check if gas is sponsored (cost would be 0)
        const isSponsored = 'paymasterAndData' in deploymentOp && deploymentOp.paymasterAndData !== "0x";

        // Get the wei amount for calculations
        const weiAmount = isSponsored ? BigInt(0) : gasCost;

        // Format ETH amount
        const ethAmount = formatEther(weiAmount);

        // Calculate USD amount using bigint arithmetic
        const usdAmount = priceUsd ? weiToUsd(weiAmount, priceUsd) : "0.00";

        return {
          ethAmount,
          usdAmount,
          isSponsored,
        };
      } catch (error) {
        console.error("Error estimating deployment fee:", error);
        // Return default values on error
        return {
          ethAmount: "0",
          usdAmount: "0",
          isSponsored: true,
        };
      }
    },
    enabled: !!para && walletId !== null && index >= 0,
    staleTime: 60_000, // 1 minute
    retry: 1,
  });

  return query;
}
