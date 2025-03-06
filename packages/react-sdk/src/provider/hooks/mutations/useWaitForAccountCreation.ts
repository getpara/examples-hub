import { UseMutateAsyncFunction, UseMutateFunction, useMutation, useQueryClient } from '@tanstack/react-query';
import { useClient } from '../index.js';
import { waitForAccountCreation, waitForAccountCreationArgs } from '../../actions/waitForAccountCreation.js';
import { ACCOUNT_BASE_KEY } from '../queries/useAccount.js';
import { WALLET_BASE_KEY } from '../queries/useWallet.js';
import { UseMutationReturnType } from '../../types/query.js';
import { Compute } from '../../types/utils.js';
import { renameMutations } from '../../utils/renameMutations.js';

type UseWaitForAccountCreationReturnType<
  TData = boolean,
  TError = Error,
  TVariables = waitForAccountCreationArgs,
  TContext = unknown,
> = Compute<
  UseMutationReturnType<TData, TError, TVariables, TContext> & {
    waitForAccountCreation: UseMutateFunction<TData, TError, TVariables, TContext>;
    waitForAccountCreationAsync: UseMutateAsyncFunction<TData, TError, TVariables, TContext>;
  }
>;

/**
 * Hook for waiting for account creation
 */
export const useWaitForAccountCreation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (args: waitForAccountCreationArgs) => await waitForAccountCreation(client, args),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [ACCOUNT_BASE_KEY], exact: false });
      await queryClient.invalidateQueries({ queryKey: [WALLET_BASE_KEY], exact: false });
    },
  });

  return renameMutations<UseWaitForAccountCreationReturnType, boolean, Error, waitForAccountCreationArgs, unknown>(
    mutation,
    'waitForAccountCreation',
  );
};
