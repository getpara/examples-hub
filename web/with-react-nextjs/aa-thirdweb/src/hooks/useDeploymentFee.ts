import { useQuery } from "@tanstack/react-query";
import { formatEther } from "viem";
import { publicClient } from "@/lib/create-public-viem-client";
import { createParaThirdwebClient } from "@/lib/create-thirdweb-client";
import { useClient } from "@getpara/react-sdk";
import { useEthPrice } from "./useEthPrice";
import { weiToUsd } from "./useBalance";
import { THIRDWEB_CLIENT_ID, THIRDWEB_SECRET_KEY, thirdwebClient, CHAIN } from "@/config/thirdweb";
import { getContract } from "thirdweb";
import { isContractDeployed } from "thirdweb/utils";

export interface DeploymentFee {
  ethAmount: string;
  usdAmount: string;
  isSponsored: boolean;
}

export function useDeploymentFee(walletId: string | null, index: number) {
  const para = useClient();
  const { priceUsd } = useEthPrice();

  const { data, isLoading, isError, error } = useQuery<DeploymentFee | undefined>({
    queryKey: ["deploymentFee", walletId, index],
    queryFn: async () => {
      // Thirdweb sponsors deployment fees when client is configured
      if (THIRDWEB_CLIENT_ID || THIRDWEB_SECRET_KEY) {
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
        const { account } = await createParaThirdwebClient(para, BigInt(index));

        // Create a contract instance for the smart wallet address
        const contract = getContract({
          client: thirdwebClient,
          chain: CHAIN,
          address: account.address,
        });

        // Check if account is already deployed
        const isDeployed = await isContractDeployed(contract);
        
        if (isDeployed) {
          return {
            ethAmount: "0",
            usdAmount: "0",
            isSponsored: true,
          };
        }

        // For Thirdweb, deployment is always sponsored through gas sponsorship
        return {
          ethAmount: "0",
          usdAmount: "0",
          isSponsored: true,
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
