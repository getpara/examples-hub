import { UseMutateAsyncFunction, UseMutateFunction, useMutation } from '@tanstack/react-query';
import { useClient, useWallet } from '../index.js';
import { signMessage, SignMessageArgs } from '../../actions/signMessage.js';
import { Compute } from '../../types/utils.js';
import { UseMutationReturnType } from '../../types/query.js';
import { renameMutations } from '../../utils/renameMutations.js';
import { FullSignatureRes } from '@getpara/web-sdk';

type SignMessageMutationArgs = Omit<SignMessageArgs, 'walletId'> & Partial<Pick<SignMessageArgs, 'walletId'>>;

type UseSignMessageReturnType<
  TData = FullSignatureRes,
  TError = Error,
  TVariables = SignMessageMutationArgs,
  TContext = unknown,
> = Compute<
  UseMutationReturnType<TData, TError, TVariables, TContext> & {
    signMessage: UseMutateFunction<TData, TError, TVariables, TContext>;
    signMessageAsync: UseMutateAsyncFunction<TData, TError, TVariables, TContext>;
  }
>;

/**
 * Hook for signing a message
 */
export const useSignMessage = () => {
  const client = useClient();
  const { data: wallet } = useWallet();

  const mutation = useMutation({
    mutationFn: async (args: SignMessageMutationArgs) => {
      let walletId = args?.walletId;

      if (!walletId) {
        walletId = wallet?.id;
      }

      if (!walletId) {
        throw Error('no wallet id found');
      }

      return await signMessage(client, { ...args, walletId });
    },
  });

  return renameMutations<UseSignMessageReturnType, FullSignatureRes, Error, SignMessageMutationArgs, unknown>(
    mutation,
    'signMessage',
  );
};
