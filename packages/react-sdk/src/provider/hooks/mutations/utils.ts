import { CoreMethodName, CoreMethodParams, CoreMethods } from '@getpara/web-sdk';
import { CoreMethodHook, CoreMethodMutation, CoreMethodMutationState, CoreMethodStateHook } from '../../types/utils.js';
import { renameCoreMutations } from '../../utils/renameMutations.js';
import { useClient } from '../utils/index.js';
import { useMutation, useMutationState } from '@tanstack/react-query';
import { CoreAction } from '../../actions/utils.js';

export function generateHook<const method extends CoreMethodName & keyof CoreMethods>(
  method: method,
  action: CoreAction<method>,
  defaultParams?: CoreMethodParams<method>,
): () => CoreMethodHook<method> {
  return () => {
    const para = useClient();

    const mutation = useMutation({
      mutationKey: [method],
      mutationFn: async (args?: CoreMethodParams<method>) => {
        const result = await action(para, (args ?? defaultParams)!);

        return result;
      },
    });

    return renameCoreMutations<method>(mutation, method);
  };
}

export function generateStateHook<const method extends CoreMethodName & keyof CoreMethods>(
  method: method,
): CoreMethodStateHook<method> {
  return () => {
    const frames = useMutationState<CoreMethodMutationState<method>>({
      filters: { mutationKey: [method] },
      select: (mutation: CoreMethodMutation<method>) => mutation.state,
    });

    const latest = frames[frames.length - 1];

    if (!latest) {
      return {
        data: undefined,
        error: null,
        failureCount: 0,
        isLoading: false,
        isPaused: false,
        isPending: false,
        isError: false,
        isSuccess: false,
        isIdle: true,
        status: 'idle',
        variables: undefined,
        context: null,
        failureReason: null,
        submittedAt: 0,
      };
    }

    return {
      ...latest,
      isPending: latest.status === 'pending',
      isError: latest.status === 'error',
      isSuccess: latest.status === 'success',
      isIdle: latest.status === 'idle',
    };
  };
}
