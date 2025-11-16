import { useMutation } from "@tanstack/react-query";
import { para } from "@/lib/para/client";
import { queryClient } from "@/context/QueryProvider";

interface CreateWalletParams {
  skipDistribute?: boolean;
}

interface WaitForWalletCreationParams {
  isCanceled?: () => boolean;
  onPoll?: () => void;
  onCancel?: () => void;
}

export function useParaWallet() {
  // Create wallet mutation
  const createWalletMutation = useMutation({
    mutationFn: async ({ skipDistribute = false }: CreateWalletParams = {}) => {
      return await para.createWallet({ type: "EVM", skipDistribute });
    },
    onSuccess: () => {
      // Invalidate wallet queries after creation
      queryClient.invalidateQueries({ queryKey: ["paraAccount", "wallet"] });
    },
  });

  // Wait for wallet creation mutation
  const waitForWalletCreationMutation = useMutation({
    mutationFn: async (params?: WaitForWalletCreationParams) => {
      return await para.waitForWalletCreation(params || {});
    },
    onSuccess: () => {
      // Invalidate all account queries after wallet creation
      queryClient.invalidateQueries({ queryKey: ["paraAccount"] });
    },
  });

  return {
    createWallet: createWalletMutation.mutate,
    createWalletAsync: createWalletMutation.mutateAsync,
    isCreatingWallet: createWalletMutation.isPending,
    createWalletError: createWalletMutation.error,
    
    waitForWalletCreation: waitForWalletCreationMutation.mutate,
    waitForWalletCreationAsync: waitForWalletCreationMutation.mutateAsync,
    isWaitingForWalletCreation: waitForWalletCreationMutation.isPending,
    waitForWalletCreationError: waitForWalletCreationMutation.error,
  };
}