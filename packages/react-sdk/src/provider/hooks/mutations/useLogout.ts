import { UseMutateAsyncFunction, UseMutateFunction, useMutation, useQueryClient } from '@tanstack/react-query';
import { useClient } from '../index.js';
import { logout, LogoutArgs } from '../../actions/logout.js';
import { useStore } from '../../stores/useStore.js';
import { ACCOUNT_BASE_KEY } from '../queries/useAccount.js';
import { WALLET_BASE_KEY } from '../queries/useWallet.js';
import { Compute } from '../../types/utils.js';
import { UseMutationReturnType } from '../../types/query.js';
import { renameMutations } from '../../utils/renameMutations.js';

type UseLogoutReturnType<TData = void, TError = Error, TVariables = LogoutArgs | undefined, TContext = unknown> = Compute<
  UseMutationReturnType<TData, TError, TVariables, TContext> & {
    logout: UseMutateFunction<TData, TError, TVariables, TContext>;
    logoutAsync: UseMutateAsyncFunction<TData, TError, TVariables, TContext>;
  }
>;

/**
 * Hook for logging out a user
 */
export const useLogout = () => {
  const client = useClient();
  const queryClient = useQueryClient();
  const clearSelectedWallet = useStore(state => state.clearSelectedWallet);

  const mutation = useMutation({
    mutationFn: async (args?: LogoutArgs) => await logout(client, args),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [ACCOUNT_BASE_KEY], exact: false });
      await queryClient.invalidateQueries({ queryKey: [WALLET_BASE_KEY], exact: false });
      clearSelectedWallet();
    },
  });

  return renameMutations<UseLogoutReturnType, void, Error, LogoutArgs | undefined, unknown>(mutation, 'logout');
};
