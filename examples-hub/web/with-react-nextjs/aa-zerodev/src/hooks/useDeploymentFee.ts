import { useQuery } from "@tanstack/react-query";
import { createParaZeroDevClient } from "@/lib/create-zerodev-client";
import { useClient } from "@getpara/react-sdk";
import { useEthPrice } from "./useEthPrice";
import { ZERODEV_PROJECT_ID } from "@/config/zerodev";

export interface DeploymentFee {
  ethAmount: string;
  usdAmount: string;
  isSponsored: boolean;
}

export function useDeploymentFee(walletId: string | null, index: number) {
  const para = useClient();
  useEthPrice();

  const { data, isLoading, isError, error } = useQuery<DeploymentFee | undefined>({
    queryKey: ["deploymentFee", walletId, index],
    queryFn: async () => {
      // ZeroDev always sponsors deployment fees when project ID is configured
      if (ZERODEV_PROJECT_ID) {
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
        const { account } = await createParaZeroDevClient(para, BigInt(index));

        // Check if account is already deployed
        const isDeployed = await account.isDeployed();
        
        if (isDeployed) {
          return {
            ethAmount: "0",
            usdAmount: "0",
            isSponsored: true,
          };
        }

        // For ZeroDev, deployment is always sponsored through the paymaster
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
