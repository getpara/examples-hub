import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { getContract } from "thirdweb";
import { isContractDeployed } from "thirdweb/utils";
import { CHAIN } from "@/config/thirdweb";
import { thirdwebClient } from "@/lib/thirdweb-client";

export interface UseDeploymentStatusOptions {
  onDeployed?: () => void;
  maxAttempts?: number;
}

export interface DeploymentStatus {
  isDeployed: boolean;
  attempts: number;
  address: string;
}

export function useDeploymentStatus(address: string | null, options?: UseDeploymentStatusOptions) {
  const attemptRef = useRef(0);
  const hasCalledOnDeployedRef = useRef(false);

  if (!address) {
    attemptRef.current = 0;
    hasCalledOnDeployedRef.current = false;
  }

  const { data, isLoading, isError, error } = useQuery<DeploymentStatus, Error>({
    queryKey: ["deployment-status", address],
    queryFn: async () => {
      if (!address) {
        throw new Error("No address provided");
      }

      attemptRef.current++;

      // Use Thirdweb's isContractDeployed
      const contract = getContract({
        client: thirdwebClient,
        chain: CHAIN,
        address,
      });
      const isDeployed = await isContractDeployed(contract);

      return {
        isDeployed,
        attempts: attemptRef.current,
        address,
      };
    },
    enabled: !!address,
    refetchInterval: (query) => {
      const maxAttempts = options?.maxAttempts ?? 5;
      const data = query.state.data;

      if (data?.isDeployed || attemptRef.current >= maxAttempts) {
        return false;
      }

      return 4000;
    },
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (data?.isDeployed && options?.onDeployed && !hasCalledOnDeployedRef.current) {
      hasCalledOnDeployedRef.current = true;
      options.onDeployed();
    }
  }, [data?.isDeployed, options]);

  return {
    status: data,
    isLoading,
    isError,
    error,
  };
}
