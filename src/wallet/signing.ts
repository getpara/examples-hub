import { Chain } from '@usecapsule/user-management-client';
import { Ctx } from '../definitions';
import { setupWorker } from '../workers/workerWrapper';

export async function sendTransaction(
  ctx: Ctx,
  userId: string,
  walletId: string,
  share: string,
  tx: string,
  chainId: string,
): Promise<string> {
  return await new Promise((resolve) => {
    const worker = setupWorker(async (signature) => {
      resolve(signature);
      worker.terminate();
    });
    worker.postMessage({
      env: ctx.env,
      params: { share, walletId, userId, tx, chainId },
      functionType: 'SEND_TRANSACTION',
    });
  });
}

export async function signMessage(
  ctx: Ctx,
  userId: string,
  walletId: string,
  share: string,
  message: string
): Promise<string> {
  return await new Promise((resolve) => {
    const worker = setupWorker(async (signature) => {
      resolve(signature);
      worker.terminate();
    });
    worker.postMessage({
      env: ctx.env,
      params: { share, walletId, userId, message },
      functionType: 'SIGN_MESSAGE',
    });
  });
}
