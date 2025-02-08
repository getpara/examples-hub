import { UseMutateAsyncFunction, UseMutateFunction, useMutation, useQueryClient } from '@tanstack/react-query';
import { useClient } from '../index.js';
import { waitForPasskeyAndCreateWallet } from '../../actions/waitForPasskeyAndCreateWallet.js';
import { ACCOUNT_BASE_KEY } from '../queries/useAccount.js';
import { WALLET_BASE_KEY } from '../queries/useWallet.js';
import { UseMutationReturnType } from '../../types/query.js';
import { Compute } from '../../types/utils.js';
import { renameMutations } from '../../utils/renameMutations.js';
import { AccountSetupResponse } from '@getpara/web-sdk';

type UseWaitForPasskeyAndCreateWalletReturnType<
  TData = AccountSetupResponse,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = Compute<
  UseMutationReturnType<TData, TError, TVariables, TContext> & {
    waitForPasskeyAndCreateWallet: UseMutateFunction<TData, TError, TVariables, TContext>;
    waitForPasskeyAndCreateWalletAsync: UseMutateAsyncFunction<TData, TError, TVariables, TContext>;
  }
>;

/**
 * Hook for waiting for session setup and wallet creation
 */
export const useWaitForPasskeyAndCreateWallet = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => await waitForPasskeyAndCreateWallet(client),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [ACCOUNT_BASE_KEY], exact: false });
      await queryClient.invalidateQueries({ queryKey: [WALLET_BASE_KEY], exact: false });
    },
  });

  return renameMutations<UseWaitForPasskeyAndCreateWalletReturnType, AccountSetupResponse, Error, void, unknown>(
    mutation,
    'waitForPasskeyAndCreateWallet',
  );
};
