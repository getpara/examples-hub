import ParaWeb from '@getpara/web-sdk';

export interface SignTransactionArgs {
  walletId: string;
  rlpEncodedTxBase64: string;
  chainId: string;
  timeoutMs?: number;
}

export const signTransaction = async (para?: ParaWeb, args?: SignTransactionArgs) => {
  if (!para) {
    throw new Error('no para instance');
  }

  if (!args) {
    throw new Error('no valid args passed to signTransaction');
  }

  try {
    return await para.signTransaction(args);
  } catch (e) {
    throw new Error(e);
  }
};
