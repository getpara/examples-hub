import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useClient, useWallet, useAccount } from "@getpara/react-sdk";
import { deploySmartWallet } from "@/lib/deploy-smart-wallet";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDeploymentStatus } from "./useDeploymentStatus";

export function useDeploySmartWallet() {
  const queryClient = useQueryClient();
  const para = useClient();
  const { data: wallet } = useWallet();
  const { isConnected } = useAccount();
  const { toast } = useToast();

  const [deployingAddress, setDeployingAddress] = useState<string | null>(null);
  const timeoutToastShownRef = useRef(false);

  const { status: deploymentStatus } = useDeploymentStatus(deployingAddress, {
    onDeployed: () => {
      toast({
        title: "Deployment Confirmed",
        description: "Your smart wallet has been successfully deployed on-chain.",
      });

      queryClient.invalidateQueries({ queryKey: ["smart-wallets", wallet?.id] });
      queryClient.invalidateQueries({ queryKey: ["balance", deployingAddress] });

      setDeployingAddress(null);
      timeoutToastShownRef.current = false;
    },
    maxAttempts: 5,
  });

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
      if (!para || !wallet?.id || !isConnected) {
        throw new Error("Not connected");
      }

      timeoutToastShownRef.current = false;

      const result = await deploySmartWallet(para, wallet.id, index);

      setDeployingAddress(result.address);

      return {
        ...result,
        index,
        name,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smart-wallets", wallet?.id] });
      queryClient.invalidateQueries({ queryKey: ["smart-wallet-address"] });
    },
  });
}
