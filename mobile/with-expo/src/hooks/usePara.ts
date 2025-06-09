import { ParaMobile } from "@getpara/react-native-wallet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthCreds } from "@/types";
import { createParaClient } from "@/client/para";
import { credsToParaAuth } from "@/utils/authUtils";
import { clearCreds, saveCreds } from "@/utils/credentialStoreUtils";

export const usePara = () => {
  const queryClient = useQueryClient();

  const {
    data: paraClient,
    isLoading: isClientLoading,
    isError: isClientError,
    error: paraClientError,
  } = useQuery<ParaMobile, Error>({
    queryKey: ["paraClient"],
    queryFn: createParaClient,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const {
    data: isAuthenticated = false,
    isLoading: isAuthStatusLoading,
    error: authStatusError,
    isError: isAuthStatusError,
    refetch: refreshAuthStatus,
  } = useQuery({
    queryKey: ["paraAuthStatus"],
    queryFn: async () => await paraClient?.isFullyLoggedIn(),
    enabled: !!paraClient,
  });

  const {
    mutateAsync: login,
    isPending: isLoggingIn,
    error: loginError,
    isError: isLoginError,
    reset: resetLogin,
  } = useMutation<void, Error, AuthCreds>({
    mutationFn: async (credentials) => {
      if (!paraClient) throw new Error("Para paraClient is not initialized");
      await paraClient.login(credsToParaAuth(credentials));
    },
    onSuccess: (_, credentials) => {
      queryClient.setQueryData(["paraAuthStatus"], true);
      saveCreds(credentials);
    },
    onError: clearCreds,
  });

  const {
    mutateAsync: logout,
    isPending: isLoggingOut,
    error: logoutError,
    isError: isLogoutError,
    reset: resetLogout,
  } = useMutation<void, Error>({
    mutationFn: async () => {
      if (!paraClient) throw new Error("Para paraClient is not initialized");
      await paraClient.logout();
    },
    onSuccess: () => {
      queryClient.setQueryData(["paraAuthStatus"], false);
      clearCreds();
    },
  });

  const {
    mutateAsync: registerPasskey,
    isPending: isRegisteringPasskey,
    error: registerPasskeyError,
    isError: isRegisterPasskeyError,
    reset: resetRegisterPasskey,
  } = useMutation<void, Error, AuthCreds & { biometricsId: string }>({
    mutationFn: async (args) => {
      if (!paraClient) throw new Error("Para paraClient is not initialized");
      await paraClient.registerPasskey(args);
    },
    onSuccess: () => queryClient.setQueryData(["paraAuthStatus"], true),
  });

  const isClientReady = !!paraClient && !isClientError;
  const isEnvError = paraClientError?.message?.includes("Missing required environment variable");

  return {
    paraClient,
    isClientLoading,
    isClientReady,
    paraClientError,
    isClientError: isClientError && !isEnvError,
    isEnvError,
    isAuthenticated,
    isAuthStatusLoading,
    authStatusError,
    isAuthStatusError,
    refreshAuthStatus,
    login,
    isLoggingIn,
    loginError,
    isLoginError,
    resetLogin,
    logout,
    isLoggingOut,
    logoutError,
    isLogoutError,
    resetLogout,
    registerPasskey,
    isRegisteringPasskey,
    registerPasskeyError,
    isRegisterPasskeyError,
    resetRegisterPasskey,
  };
};
