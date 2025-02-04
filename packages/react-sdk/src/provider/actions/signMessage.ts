import ParaWeb from '@getpara/web-sdk';

export interface SignMessageArgs {
  walletId: string;
  messageBase64: string;
  timeoutMs?: number;
  cosmosSignDocBase64?: string;
}

export const signMessage = async (para?: ParaWeb, args?: SignMessageArgs) => {
  if (!para) {
    throw new Error('no para instance');
  }

  if (!args) {
    throw new Error('no valid args passed to signMessage');
  }

  try {
    return await para.signMessage(args);
  } catch (e) {
    throw new Error(e);
  }
};
