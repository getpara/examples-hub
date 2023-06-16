import { Chain } from '@usecapsule/user-management-client';
import { Ctx } from '../definitions';
import { SignatureRes } from '../types/walletTypes';
import { setupWorker } from '../workers/workerWrapper';

export async function sendTransaction(
  ctx: Ctx,
  userId: string,
  walletId: string,
  share: string,
  tx: string,
  chainId: string,
): Promise<SignatureRes> {
  return await new Promise(async (resolve) => {
    const worker = await setupWorker(ctx, async (sendTransactionRes) => {
      resolve(sendTransactionRes);
      worker.terminate();
    });
    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
      params: { share, walletId, userId, tx, chainId },
      functionType: 'SEND_TRANSACTION',
      offloadMPCComputationURL: ctx.offloadMPCComputationURL,
    });
  });
}

export async function signMessage(
  ctx: Ctx,
  userId: string,
  walletId: string,
  share: string,
  message: string
): Promise<SignatureRes> {
  return await new Promise(async (resolve) => {
    const worker = await setupWorker(ctx, async (signMessageRes) => {
      resolve(signMessageRes);
      worker.terminate();
    });
    worker.postMessage({
      env: ctx.env,
      params: { share, walletId, userId, message },
      functionType: 'SIGN_MESSAGE',
      offloadMPCComputationURL: ctx.offloadMPCComputationURL,
    });
  });
}
