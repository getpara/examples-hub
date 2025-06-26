import { useMutation } from "@tanstack/react-query";
import { para } from "@/lib/para/client";
import { queryClient } from "@/context/QueryProvider";
import type { AuthState } from "@getpara/web-sdk";

interface SignUpOrLoginParams {
  email: string;
}

interface VerifyAccountParams {
  verificationCode: string;
}

export function useParaAuth() {
  // Sign up or login mutation
  const signUpOrLoginMutation = useMutation({
    mutationFn: async ({ email }: SignUpOrLoginParams) => {
      return await para.signUpOrLogIn({ auth: { email } });
    },
    onSuccess: () => {
      // Invalidate account queries after auth state change
      queryClient.invalidateQueries({ queryKey: ["paraAccount"] });
    },
  });

  // Verify new account mutation
  const verifyAccountMutation = useMutation({
    mutationFn: async ({ verificationCode }: VerifyAccountParams) => {
      return await para.verifyNewAccount({ verificationCode });
    },
    onSuccess: () => {
      // Invalidate account queries after verification
      queryClient.invalidateQueries({ queryKey: ["paraAccount"] });
    },
  });

  // Wait for login mutation
  const waitForLoginMutation = useMutation({
    mutationFn: async ({ isCanceled }: { isCanceled?: () => boolean }) => {
      return await para.waitForLogin({ isCanceled });
    },
    onSuccess: () => {
      // Invalidate account queries after successful login
      queryClient.invalidateQueries({ queryKey: ["paraAccount"] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await para.logout();
    },
    onSuccess: () => {
      // Invalidate all queries after logout
      queryClient.invalidateQueries();
    },
  });

  return {
    signUpOrLogin: signUpOrLoginMutation.mutate,
    signUpOrLoginAsync: signUpOrLoginMutation.mutateAsync,
    isSigningUpOrLoggingIn: signUpOrLoginMutation.isPending,
    signUpOrLoginError: signUpOrLoginMutation.error,
    
    verifyAccount: verifyAccountMutation.mutate,
    verifyAccountAsync: verifyAccountMutation.mutateAsync,
    isVerifying: verifyAccountMutation.isPending,
    verifyError: verifyAccountMutation.error,
    
    waitForLogin: waitForLoginMutation.mutate,
    waitForLoginAsync: waitForLoginMutation.mutateAsync,
    isWaitingForLogin: waitForLoginMutation.isPending,
    waitForLoginError: waitForLoginMutation.error,
    
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    logoutError: logoutMutation.error,
  };
}