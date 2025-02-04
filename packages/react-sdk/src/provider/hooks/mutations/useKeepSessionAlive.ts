import { UseMutateAsyncFunction, UseMutateFunction, useMutation } from '@tanstack/react-query';
import { useClient } from '../index.js';
import { keepSessionAlive } from '../../actions/keepSessionAlive.js';
import { Compute } from '../../types/utils.js';
import { UseMutationReturnType } from '../../types/query.js';
import { renameMutations } from '../../utils/renameMutations.js';

type UseKeepSessionAliveReturnType<TData = void, TError = Error, TVariables = void, TContext = unknown> = Compute<
  UseMutationReturnType<TData, TError, TVariables, TContext> & {
    keepSessionAlive: UseMutateFunction<TData, TError, TVariables, TContext>;
    keepSessionAliveAsync: UseMutateAsyncFunction<TData, TError, TVariables, TContext>;
  }
>;

/**
 * Hook for keeping a session alive
 */
export const useKeepSessionAlive = () => {
  const client = useClient();

  const mutation = useMutation({
    mutationFn: async () => await keepSessionAlive(client),
  });

  return renameMutations<UseKeepSessionAliveReturnType, void, Error, void, unknown>(mutation, 'keepSessionAlive');
};
