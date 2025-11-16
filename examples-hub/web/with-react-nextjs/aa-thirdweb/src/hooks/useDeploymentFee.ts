import { useQuery } from "@tanstack/react-query";
import { getSmartWalletAddress } from "@/lib/get-smart-wallet-address";
import { useClient } from "@getpara/react-sdk";
import { THIRDWEB_CLIENT_ID, THIRDWEB_SECRET_KEY, CHAIN } from "@/config/thirdweb";
import { thirdwebClient } from "@/lib/thirdweb-client";
import { getContract } from "thirdweb";
import { isContractDeployed } from "thirdweb/utils";

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
        // Efficiently predict address without creating full connection
        const address = await getSmartWalletAddress(para, walletId, index);

        // Create a contract instance for the smart wallet address
        const contract = getContract({
          client: thirdwebClient,
          chain: CHAIN,
          address: address as `0x${string}`,
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
