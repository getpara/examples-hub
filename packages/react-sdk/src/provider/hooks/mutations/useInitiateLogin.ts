import { UseMutateAsyncFunction, UseMutateFunction, useMutation } from '@tanstack/react-query';
import { useClient } from '../index.js';
import { initiateLogin, InitiateLoginArgs } from '../../actions/initiateLogin.js';
import { Compute } from '../../types/utils.js';
import { UseMutationReturnType } from '../../types/query.js';
import { renameMutations } from '../../utils/renameMutations.js';
import { AuthMethod } from '@getpara/web-sdk';

type UseInitiateLoginReturnType<
  TData = Set<AuthMethod>,
  TError = Error,
  TVariables = InitiateLoginArgs,
  TContext = unknown,
> = Compute<
  UseMutationReturnType<TData, TError, TVariables, TContext> & {
    initiateLogin: UseMutateFunction<TData, TError, TVariables, TContext>;
    initiateLoginAsync: UseMutateAsyncFunction<TData, TError, TVariables, TContext>;
  }
>;

/**
 * Hook for initiating a user login
 */
export const useInitiateLogin = () => {
  const client = useClient();

  const mutation = useMutation({
    mutationFn: async (args: InitiateLoginArgs) => await initiateLogin(client, args),
  });

  return renameMutations<UseInitiateLoginReturnType, Set<AuthMethod>, Error, InitiateLoginArgs, unknown>(
    mutation,
    'initiateLogin',
  );
};
