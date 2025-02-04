import { DefaultError, UseMutationResult } from '@tanstack/react-query';

export function renameMutations<
  TResp = unknown,
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(mutationObj: UseMutationResult<TData, TError, TVariables, TContext>, name: string): TResp {
  const { mutate: _, mutateAsync: __, ...mutationNoMutate } = mutationObj;

  const newMutations = {
    [name]: mutationObj.mutate,
    [`${name}Async`]: mutationObj.mutateAsync,
  };

  return {
    ...newMutations,
    ...mutationNoMutate,
  } as TResp;
}
