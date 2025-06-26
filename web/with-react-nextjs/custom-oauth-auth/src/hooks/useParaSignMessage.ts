import { useMutation, useQuery } from "@tanstack/react-query";
import { para } from "@/lib/para/client";

interface SignMessageParams {
  message: string;
  walletId?: string;
  timeoutMs?: number;
  onPoll?: () => void;
  onCancel?: () => void;
  isCanceled?: () => boolean;
}

export function useParaSignMessage() {
  // Get the first wallet ID
  const { data: walletId } = useQuery({
    queryKey: ["paraAccount", "walletId"],
    queryFn: async () => {
      const wallets = Object.values(await para.getWallets());
      return wallets?.[0]?.id || null;
    },
    enabled: true,
  });

  // Sign message mutation
  const signMessageMutation = useMutation({
    mutationFn: async ({ 
      message, 
      walletId: customWalletId,
      timeoutMs = 120000,
      ...pollParams 
    }: SignMessageParams) => {
      const finalWalletId = customWalletId || walletId;
      
      if (!finalWalletId) {
        throw new Error("No wallet ID available");
      }

      // Convert message to base64
      const messageBase64 = btoa(message);

      return await para.signMessage({
        walletId: finalWalletId,
        messageBase64,
        timeoutMs,
        ...pollParams,
      });
    },
  });

  return {
    signMessage: signMessageMutation.mutate,
    signMessageAsync: signMessageMutation.mutateAsync,
    isSigning: signMessageMutation.isPending,
    signError: signMessageMutation.error,
    signature: signMessageMutation.data,
    reset: signMessageMutation.reset,
  };
}