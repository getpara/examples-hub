import { useQuery } from "@tanstack/react-query";
import { formatEther } from "viem";
import { publicClient } from "@/lib/create-public-viem-client";
import { createParaAlchemyClient } from "@/lib/create-alchemy-client";
import { generateSalt } from "@/lib/generate-salt";
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

  const { data, isLoading, isError, error } = useQuery<DeploymentFee | undefined>({
    queryKey: ["deploymentFee", walletId, index],
    queryFn: async () => {
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
        const salt = generateSalt(walletId, index);
        const client = await createParaAlchemyClient(para, salt);

        const deploymentOp = await client.buildUserOperation({
          uo: {
            target: client.account.address,
            data: "0x",
            value: BigInt(0),
          },
        });

        const gasPrice = await publicClient.getGasPrice();

        const totalGasUnits =
          BigInt(deploymentOp.callGasLimit || 0) +
          BigInt(deploymentOp.verificationGasLimit || 0) +
          BigInt(deploymentOp.preVerificationGas || 0);

        const gasCost = totalGasUnits * gasPrice;

        const isSponsored = "paymasterAndData" in deploymentOp && deploymentOp.paymasterAndData !== "0x";

        const weiAmount = isSponsored ? BigInt(0) : gasCost;

        const ethAmount = formatEther(weiAmount);

        const usdAmount = priceUsd ? weiToUsd(weiAmount, priceUsd) : "0.00";

        return {
          ethAmount,
          usdAmount,
          isSponsored,
        };
      } catch (error) {
        console.error("Error estimating deployment fee:", error);
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

  return {
    fee: data,
    isLoading,
    isError,
    error,
  };
}
