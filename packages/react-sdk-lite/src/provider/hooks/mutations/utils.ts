import {
  CoreMethodName,
  CoreMethodParams,
  CoreMethods,
  InternalAction,
  InternalMethodName,
  InternalMethodParams,
  InternalMethods,
} from '@getpara/web-sdk';
import {
  CoreMethodMutationHook,
  CoreMethodMutation,
  CoreMethodMutationState,
  CoreMethodMutationStateHook,
  InternalMethodMutationHook,
} from '../../types/utils.js';
import { renameCoreMutations } from '../../utils/renameMutations.js';
import { useClient } from '../utils/index.js';
import { useMutation, useMutationState } from '@tanstack/react-query';
import { CoreAction } from '../../actions/utils.js';
import { useInternalClient } from '../utils/useInternalClient.js';

export function generateCoreMutation<const method extends CoreMethodName & keyof CoreMethods>(
  method: method,
  action: CoreAction<method>,
  {
    delay,
    defaultParams,
  }: {
    delay?: number;
    defaultParams?: CoreMethodParams<method>;
  } = {},
): () => CoreMethodMutationHook<method> {
  return () => {
    const para = useClient();

    const mutation = useMutation({
      mutationKey: [method],
      mutationFn: async (args?: CoreMethodParams<method>) => {
        if (typeof delay === 'number') await new Promise(resolve => setTimeout(resolve, delay));

        try {
          const result = await action(para, (args ?? defaultParams)!);

          return result;
        } catch (error) {
          throw error;
        }
      },
    });

    return renameCoreMutations<method>(mutation, method);
  };
}

export function generateInternalMutation<const method extends InternalMethodName & keyof InternalMethods>(
  method: method,
  action: InternalAction<method>,
  {
    delay,
    defaultParams,
  }: {
    delay?: number;
    defaultParams?: InternalMethodParams<method>;
  } = {},
): () => InternalMethodMutationHook<method> {
  return () => {
    const para = useInternalClient();

    const mutation = useMutation({
      mutationKey: [method],
      mutationFn: async (args?: InternalMethodParams<method>) => {
        if (typeof delay === 'number') await new Promise(resolve => setTimeout(resolve, delay));

        try {
          const result = await action(para, (args ?? defaultParams)!);

          return result;
        } catch (error) {
          throw error;
        }
      },
    });

    return mutation as InternalMethodMutationHook<method>;
  };
}

export function generateStateHook<const method extends CoreMethodName & keyof CoreMethods>(
  method: method,
): CoreMethodMutationStateHook<method> {
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
