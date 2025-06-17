import { ParaMobile } from '@getpara/react-native-wallet';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthCreds } from '@/types';
import { createParaClient } from '@/client/para';
import { credsToParaAuth, clearCreds, saveCreds } from '@/utils';
import { QUERY_KEYS, MUTATION_KEYS } from '@/constants/queryKeys';
import {
  createAuthDependentQueryOptions,
  createMutationOptions,
} from '@/utils/queryUtils';

export const usePara = () => {
  const queryClient = useQueryClient();

  const {
    data: paraClient,
    isLoading: isClientLoading,
    isError: isClientError,
    error: paraClientError,
  } = useQuery<ParaMobile, Error>({
    queryKey: ['paraClient'], // Keep separate as this is a singleton
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
  } = useQuery(
    createAuthDependentQueryOptions(!!paraClient, {
      queryKey: QUERY_KEYS.PARA_AUTH_STATUS,
      queryFn: async () => await paraClient?.isFullyLoggedIn(),
    })
  );

  const {
    mutateAsync: login,
    isPending: isLoggingIn,
    error: loginError,
    isError: isLoginError,
    reset: resetLogin,
  } = useMutation<void, Error, AuthCreds>(
    createMutationOptions({
      mutationKey: MUTATION_KEYS.PARA_LOGIN,
      mutationFn: async (credentials) => {
        if (!paraClient) throw new Error('Para paraClient is not initialized');
        await paraClient.login(credsToParaAuth(credentials));
      },
      onSuccess: async (_, credentials) => {
        // Invalidate instead of setQueryData to ensure fresh state
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PARA_AUTH_STATUS,
        });
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS });
        saveCreds(credentials);
      },
      onError: clearCreds,
    })
  );

  const {
    mutateAsync: logout,
    isPending: isLoggingOut,
    error: logoutError,
    isError: isLogoutError,
    reset: resetLogout,
  } = useMutation<void, Error>(
    createMutationOptions({
      mutationKey: MUTATION_KEYS.PARA_LOGOUT,
      mutationFn: async () => {
        if (!paraClient) throw new Error('Para paraClient is not initialized');
        await paraClient.logout();
      },
      onSuccess: async () => {
        // Clear all auth-related queries
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PARA_AUTH_STATUS,
        });
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS });
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SIGNERS });
        clearCreds();
      },
    })
  );

  const {
    mutateAsync: registerPasskey,
    isPending: isRegisteringPasskey,
    error: registerPasskeyError,
    isError: isRegisterPasskeyError,
    reset: resetRegisterPasskey,
  } = useMutation<void, Error, AuthCreds & { biometricsId: string }>(
    createMutationOptions({
      mutationKey: MUTATION_KEYS.PARA_REGISTER_PASSKEY,
      mutationFn: async (args) => {
        if (!paraClient) throw new Error('Para paraClient is not initialized');
        await paraClient.registerPasskey(args);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PARA_AUTH_STATUS,
        });
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS });
      },
    })
  );

  const isClientReady = !!paraClient && !isClientError;
  const isEnvError = paraClientError?.message?.includes(
    'Missing required environment variable'
  );

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
