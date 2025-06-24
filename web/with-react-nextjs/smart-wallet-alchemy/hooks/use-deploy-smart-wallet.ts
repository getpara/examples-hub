import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useClient, useWallet, useAccount } from "@getpara/react-sdk";
import { deploySmartWallet } from "@/lib/smart-wallet/core";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDeploymentStatus } from "./use-deployment-status";

export function useDeploySmartWallet() {
  const queryClient = useQueryClient();
  const para = useClient();
  const { data: wallet } = useWallet();
  const { data: account } = useAccount();
  const { toast } = useToast();
  const [deployingAddress, setDeployingAddress] = useState<string | null>(null);
  const timeoutToastShownRef = useRef(false);

  // Use the deployment status hook for polling
  const { data: deploymentStatus } = useDeploymentStatus(deployingAddress, {
    onDeployed: () => {
      toast({
        title: "Deployment Confirmed",
        description: "Your smart wallet has been successfully deployed on-chain.",
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['smart-wallets', wallet?.id] });
      queryClient.invalidateQueries({ queryKey: ['balance', deployingAddress] });
      
      // Clear the deploying address and reset timeout flag
      setDeployingAddress(null);
      timeoutToastShownRef.current = false;
    },
    maxAttempts: 5,
  });

  // Show timeout warning if max attempts reached without deployment
  useEffect(() => {
    if (
      deploymentStatus &&
      !deploymentStatus.isDeployed &&
      deploymentStatus.attempts >= 5 &&
      !timeoutToastShownRef.current
    ) {
      timeoutToastShownRef.current = true;
      toast({
        title: "Deployment Verification Timeout",
        description: "Unable to confirm deployment. The wallet may still be deploying. Please check back later.",
        variant: "destructive",
      });
      setDeployingAddress(null);
    }
  }, [deploymentStatus, toast]);

  return useMutation({
    mutationFn: async ({ index, name }: { index: number; name: string }) => {
      if (!para || !wallet?.id || !account?.isConnected) {
        throw new Error('Not connected');
      }

      // Reset timeout flag when starting new deployment
      timeoutToastShownRef.current = false;

      const result = await deploySmartWallet(para, wallet.id, index);
      
      // Set the address for polling
      setDeployingAddress(result.address);
      
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