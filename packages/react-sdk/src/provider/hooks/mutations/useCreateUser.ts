import { UseMutateAsyncFunction, UseMutateFunction, useMutation } from '@tanstack/react-query';
import { useClient } from '../index.js';
import { createUser, CreateUserArgs } from '../../actions/createUser.js';
import { Compute } from '../../types/utils.js';
import { UseMutationReturnType } from '../../types/query.js';
import { renameMutations } from '../../utils/renameMutations.js';

type UseCreateUserReturnType<TData = void, TError = Error, TVariables = CreateUserArgs, TContext = unknown> = Compute<
  UseMutationReturnType<TData, TError, TVariables, TContext> & {
    createUser: UseMutateFunction<TData, TError, TVariables, TContext>;
    createUserAsync: UseMutateAsyncFunction<TData, TError, TVariables, TContext>;
  }
>;

/**
 * Hook for creating a new user
 */
export const useCreateUser = () => {
  const client = useClient();

  const mutation = useMutation({
    mutationFn: async (args: CreateUserArgs) => await createUser(client, args),
  });

  return renameMutations<UseCreateUserReturnType, void, Error, CreateUserArgs, unknown>(mutation, 'createUser');
};
