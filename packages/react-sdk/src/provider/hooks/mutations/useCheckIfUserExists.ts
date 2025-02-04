import { UseMutateAsyncFunction, UseMutateFunction, useMutation } from '@tanstack/react-query';
import { useClient } from '../index.js';
import { checkIfUserExists, CheckIfUserExistsArgs } from '../../actions/checkIfUserExists.js';
import { renameMutations } from '../../utils/renameMutations.js';
import { Compute } from '../../types/utils.js';
import { UseMutationReturnType } from '../../types/query.js';

type UseCheckIfUserExistsReturnType<
  TData = boolean,
  TError = Error,
  TVariables = CheckIfUserExistsArgs,
  TContext = unknown,
> = Compute<
  UseMutationReturnType<TData, TError, TVariables, TContext> & {
    checkIfUserExists: UseMutateFunction<TData, TError, TVariables, TContext>;
    checkIfUserExistsAsync: UseMutateAsyncFunction<TData, TError, TVariables, TContext>;
  }
>;

/**
 * Hook for checking is a user exists
 */
export const useCheckIfUserExists = () => {
  const client = useClient();

  const mutation = useMutation({
    mutationFn: async (args: CheckIfUserExistsArgs) => await checkIfUserExists(client, args),
  });

  return renameMutations<UseCheckIfUserExistsReturnType, boolean, Error, CheckIfUserExistsArgs, unknown>(
    mutation,
    'checkIfUserExists',
  );
};
