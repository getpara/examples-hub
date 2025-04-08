import { UseMutateAsyncFunction, UseMutateFunction, useMutation } from '@tanstack/react-query';
import { useClient, useWallet } from '../index.js';
import { signTransaction, SignTransactionArgs } from '../../actions/signTransaction.js';
import { Compute } from '../../types/utils.js';
import { UseMutationReturnType } from '../../types/query.js';
import { renameMutations } from '../../utils/renameMutations.js';
import { FullSignatureRes } from '@getpara/web-sdk';

type SignTransactionMutationArgs = Omit<SignTransactionArgs, 'walletId'> & Partial<Pick<SignTransactionArgs, 'walletId'>>;

type UseSignTransactionReturnType<
  TData = FullSignatureRes,
  TError = Error,
  TVariables = SignTransactionMutationArgs,
  TContext = unknown,
> = Compute<
  UseMutationReturnType<TData, TError, TVariables, TContext> & {
    signTransaction: UseMutateFunction<TData, TError, TVariables, TContext>;
    signTransactionAsync: UseMutateAsyncFunction<TData, TError, TVariables, TContext>;
  }
>;

/**
 * Hook for signing a transaction
 */
export const useSignTransaction = () => {
  const client = useClient();
  const { data: wallet } = useWallet();

  const mutation = useMutation({
    mutationFn: async (args: SignTransactionMutationArgs) => {
      let walletId = args?.walletId;

      if (!walletId) {
        walletId = wallet?.id;
      }

      if (!walletId) {
        throw Error('no wallet id found');
      }

      return await signTransaction(client, { ...args, walletId });
    },
  });

  return renameMutations<UseSignTransactionReturnType, FullSignatureRes, Error, SignTransactionMutationArgs, unknown>(
    mutation,
    'signTransaction',
  );
};
