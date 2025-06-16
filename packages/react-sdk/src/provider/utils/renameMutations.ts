import { CoreMethodName, CoreMethodParams, CoreMethodResponse, CoreMethods } from '@getpara/web-sdk';
import { DefaultError, UseMutationResult } from '@tanstack/react-query';
import { CoreMethodMutationHook } from '../types/utils.js';

export function renameMutations<
  TResp = unknown,
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(mutationObj: UseMutationResult<TData, TError, TVariables, TContext>, name: string): TResp {
  const newMutations = {
    [name]: mutationObj.mutate,
    [`${name}Async`]: mutationObj.mutateAsync,
  };

  return {
    ...newMutations,
    ...mutationObj,
  } as TResp;
}

export function renameCoreMutations<method extends CoreMethodName & keyof CoreMethods>(
  mutationObj: UseMutationResult<CoreMethodResponse<method>, Error, CoreMethodParams<method> | undefined, unknown>,
  name: method,
): CoreMethodMutationHook<method> {
  return renameMutations(mutationObj, name);
}
