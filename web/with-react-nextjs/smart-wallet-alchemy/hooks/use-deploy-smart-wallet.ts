import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useClient, useWallet, useAccount } from "@getpara/react-sdk";
import { deploySmartWallet } from "@/lib/smart-wallet/core";
import { publicClient } from "@/lib/viem-client";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function useDeploySmartWallet() {
  const queryClient = useQueryClient();
  const para = useClient();
  const { data: wallet } = useWallet();
  const { data: account } = useAccount();
  const { toast } = useToast();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttempts = useRef<number>(0);

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
      
      // Reset polling attempts
      pollingAttempts.current = 0;
      const maxAttempts = 5;

      pollingIntervalRef.current = setInterval(async () => {
        pollingAttempts.current++;
        
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
            
            // Show success toast
            toast({
              title: "Deployment Confirmed",
              description: "Your smart wallet has been successfully deployed on-chain.",
            });
          } else if (pollingAttempts.current >= maxAttempts) {
            // Max attempts reached
            console.error(`[useDeploySmartWallet] Max polling attempts reached for ${result.address}`);
            
            // Clear the polling interval
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            
            // Show warning toast
            toast({
              title: "Deployment Verification Timeout",
              description: "Unable to confirm deployment. The wallet may still be deploying. Please check back later.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error(`[useDeploySmartWallet] Error checking deployment status:`, error);
          
          if (pollingAttempts.current >= maxAttempts) {
            // Clear the polling interval on max failed attempts
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            
            // Show error toast
            toast({
              title: "Deployment Check Failed",
              description: "Unable to verify deployment status. Please check your wallet manually.",
              variant: "destructive",
            });
          }
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