import { UseMutateAsyncFunction, UseMutateFunction, useMutation, useQueryClient } from '@tanstack/react-query';
import { useClient } from '../index.js';
import { waitForLoginAndSetup, WaitForLoginAndSetupArgs } from '../../actions/waitForLoginAndSetup.js';
import { ACCOUNT_BASE_KEY } from '../queries/useAccount.js';
import { WALLET_BASE_KEY } from '../queries/useWallet.js';
import { Compute } from '../../types/utils.js';
import { UseMutationReturnType } from '../../types/query.js';
import { renameMutations } from '../../utils/renameMutations.js';
import { LoginResponse } from '@getpara/web-sdk';

type UseWaitForLoginAndSetupReturnType<
  TData = LoginResponse,
  TError = Error,
  TVariables = WaitForLoginAndSetupArgs,
  TContext = unknown,
> = Compute<
  UseMutationReturnType<TData, TError, TVariables, TContext> & {
    waitForLoginAndSetup: UseMutateFunction<TData, TError, TVariables, TContext>;
    waitForLoginAndSetupAsync: UseMutateAsyncFunction<TData, TError, TVariables, TContext>;
  }
>;

/**
 * Hook for waiting for user login and account setup
 */
export const useWaitForLoginAndSetup = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (args: WaitForLoginAndSetupArgs) => await waitForLoginAndSetup(client, args),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [ACCOUNT_BASE_KEY], exact: false });
      await queryClient.invalidateQueries({ queryKey: [WALLET_BASE_KEY], exact: false });
    },
  });

  return renameMutations<UseWaitForLoginAndSetupReturnType, LoginResponse, Error, WaitForLoginAndSetupArgs, unknown>(
    mutation,
    'waitForLoginAndSetup',
  );
};
