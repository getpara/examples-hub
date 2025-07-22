import { DefaultError, UseMutateAsyncFunction, UseMutateFunction, UseMutationResult } from '@tanstack/react-query';
import { Compute } from '../types/utils.js';

// Utility type to omit mutate and mutateAsync, and add custom keys
type RenamedMutationResult<TData, TError, TVariables, TContext, TName extends string> = Omit<
  UseMutationResult<TData, TError, TVariables, TContext>,
  'mutate' | 'mutateAsync'
> & {
  [K in TName]: UseMutateFunction<TData, TError, TVariables, TContext>;
} & {
  [K in `${TName}Async`]: UseMutateAsyncFunction<TData, TError, TVariables, TContext>;
};

export function renameMutations<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
  TName extends string = string,
>(
  mutationObj: UseMutationResult<TData, TError, TVariables, TContext>,
  name: TName,
): Compute<RenamedMutationResult<TData, TError, TVariables, TContext, TName>> {
  const newMutations = {
    [name]: mutationObj.mutate,
    [`${name}Async`]: mutationObj.mutateAsync,
  } as Record<string, unknown>;

  const { mutate: _, mutateAsync: __, ...rest } = mutationObj;

  return {
    ...newMutations,
    ...rest,
  } as RenamedMutationResult<TData, TError, TVariables, TContext, TName>;
}
