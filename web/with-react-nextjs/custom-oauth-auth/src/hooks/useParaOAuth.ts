import { useMutation } from "@tanstack/react-query";
import { para } from "@/lib/para/client";
import { queryClient } from "@/context/QueryProvider";
import type { TOAuthMethod, AuthStateLogin, AuthStateSignup } from "@getpara/web-sdk";

interface VerifyOAuthParams {
  method: Exclude<TOAuthMethod, "TELEGRAM" | "FARCASTER">;
  onOAuthUrl: (url: string) => void;
  isCanceled?: () => boolean;
}

interface VerifyFarcasterParams {
  onConnectUri: (uri: string) => void;
  isCanceled?: () => boolean;
}

interface HandleAuthStateParams {
  authState: AuthStateLogin | AuthStateSignup;
  openPopup: (url: string, name: string, features: string) => Window | null;
  popupWindow: React.MutableRefObject<Window | null>;
}

export function useParaOAuth() {
  // Verify OAuth mutation
  const verifyOAuthMutation = useMutation({
    mutationFn: async (params: VerifyOAuthParams) => {
      return await para.verifyOAuth(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paraAccount"] });
    },
  });

  // Verify Farcaster mutation
  const verifyFarcasterMutation = useMutation({
    mutationFn: async (params: VerifyFarcasterParams) => {
      return await para.verifyFarcaster(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paraAccount"] });
    },
  });

  // Handle auth state mutation
  const handleAuthStateMutation = useMutation({
    mutationFn: async ({ authState, openPopup, popupWindow }: HandleAuthStateParams) => {
      const popupConfig = {
        isCanceled: () => Boolean(popupWindow.current?.closed),
      };

      if (authState.stage === "signup") {
        openPopup(authState.passkeyUrl!, "signUpPopup", "popup=true");
        const result = await para.waitForWalletCreation(popupConfig);
        
        if (!result.walletIds) {
          throw new Error("Failed to create wallet");
        }
        
        return result;
      }

      if (authState.stage === "login") {
        openPopup(authState.passkeyUrl!, "loginPopup", "popup=true");
        return await para.waitForLogin(popupConfig);
      }

      throw new Error("Invalid auth state");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paraAccount"] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await para.logout();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  return {
    verifyOAuth: verifyOAuthMutation.mutate,
    verifyOAuthAsync: verifyOAuthMutation.mutateAsync,
    isVerifyingOAuth: verifyOAuthMutation.isPending,
    verifyOAuthError: verifyOAuthMutation.error,
    
    verifyFarcaster: verifyFarcasterMutation.mutate,
    verifyFarcasterAsync: verifyFarcasterMutation.mutateAsync,
    isVerifyingFarcaster: verifyFarcasterMutation.isPending,
    verifyFarcasterError: verifyFarcasterMutation.error,
    
    handleAuthState: handleAuthStateMutation.mutate,
    handleAuthStateAsync: handleAuthStateMutation.mutateAsync,
    isHandlingAuthState: handleAuthStateMutation.isPending,
    handleAuthStateError: handleAuthStateMutation.error,
    
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    logoutError: logoutMutation.error,
  };
}