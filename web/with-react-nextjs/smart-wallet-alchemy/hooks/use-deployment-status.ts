import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { publicClient } from "@/lib/viem-client";

export interface UseDeploymentStatusOptions {
  onDeployed?: () => void;
  maxAttempts?: number;
}

export interface DeploymentStatus {
  isDeployed: boolean;
  attempts: number;
  address: string;
}

export function useDeploymentStatus(
  address: string | null,
  options?: UseDeploymentStatusOptions
) {
  const attemptRef = useRef(0);
  const hasCalledOnDeployedRef = useRef(false);

  // Reset attempts when address changes
  if (!address) {
    attemptRef.current = 0;
    hasCalledOnDeployedRef.current = false;
  }

  const query = useQuery<DeploymentStatus, Error>({
    queryKey: ["deployment-status", address],
    queryFn: async () => {
      if (!address) {
        throw new Error("No address provided");
      }

      attemptRef.current++;
      
      const code = await publicClient.getCode({
        address: address as `0x${string}`,
      });

      const isDeployed = !!(code && code !== "0x");

      return {
        isDeployed,
        attempts: attemptRef.current,
        address,
      };
    },
    enabled: !!address,
    refetchInterval: (query) => {
      // Stop polling if deployed or max attempts reached
      const maxAttempts = options?.maxAttempts ?? 5;
      const data = query.state.data;
      
      if (data?.isDeployed || attemptRef.current >= maxAttempts) {
        return false;
      }
      
      return 4000; // Poll every 4 seconds
    },
    staleTime: 0, // Always check fresh
    gcTime: 0, // Don't cache results
    retry: false, // Don't retry on error, let refetchInterval handle it
  });

  // Handle onDeployed callback
  useEffect(() => {
    if (query.data?.isDeployed && options?.onDeployed && !hasCalledOnDeployedRef.current) {
      hasCalledOnDeployedRef.current = true;
      options.onDeployed();
    }
  }, [query.data?.isDeployed, options]);

  return query;
}