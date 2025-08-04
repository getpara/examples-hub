import { useQuery } from "@tanstack/react-query";
import { useClient } from "@getpara/react-sdk";

export interface DeploymentFee {
  ethAmount: string;
  usdAmount: string;
  isSponsored: boolean;
}

export function useDeploymentFee(walletId: string | null, index: number) {
  const para = useClient();

  const { data, isLoading, isError, error } = useQuery<DeploymentFee | undefined>({
    queryKey: ["deploymentFee", walletId, index],
    queryFn: async () => {
      // Currently all deployments are sponsored through Gelato
      // If you need to implement actual fee calculation in the future,
      // you can add gas estimation logic here
      return {
        ethAmount: "0",
        usdAmount: "0",
        isSponsored: true,
      };
    },
    enabled: !!para && walletId !== null && index >= 0,
    staleTime: 60_000,
    retry: 1,
  });

  return {
    fee: data,
    isLoading,
    isError,
    error,
  };
}
