import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useClient, useWallet, useAccount } from "@getpara/react-sdk";
import { deploySmartWallet } from "@/lib/smart-wallet/core";
import { publicClient } from "@/lib/viem-client";
import { useEffect, useRef } from "react";

export function useDeploySmartWallet() {
  const queryClient = useQueryClient();
  const para = useClient();
  const { data: wallet } = useWallet();
  const { data: account } = useAccount();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return useMutation({
    mutationFn: async ({ index, name }: { index: number; name: string }) => {
      if (!para || !wallet?.id || !account?.isConnected) {
        throw new Error('Not connected');
      }

      const result = await deploySmartWallet(para, wallet.id, index);
      
      // Start polling for deployment confirmation
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      pollingIntervalRef.current = setInterval(async () => {
        try {
          const code = await publicClient.getCode({
            address: result.address as `0x${string}`,
          });

          if (code && code !== "0x") {
            // Deployment confirmed
            console.log(`[useDeploySmartWallet] Deployment confirmed for ${result.address}`);
            
            // Clear the polling interval
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['smart-wallets', wallet?.id] });
            queryClient.invalidateQueries({ queryKey: ['balance', result.address] });
          }
        } catch (error) {
          console.error(`[useDeploySmartWallet] Error checking deployment status:`, error);
        }
      }, 4000); // Poll every 4 seconds
      
      return {
        ...result,
        index,
        name,
      };
    },
    onSuccess: () => {
      // Initial invalidation
      queryClient.invalidateQueries({ queryKey: ['smart-wallets', wallet?.id] });
      queryClient.invalidateQueries({ queryKey: ['smart-wallet-address'] });
    },
  });
}