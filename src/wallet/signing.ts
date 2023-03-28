import { Chain } from '@capsule/client';
import { setupWorker } from '../workers/workerWrapper';

export async function sendTransaction(
  userId: string,
  walletId: string,
  share: string,
  tx: string,
  chain: Chain,
): Promise<string> {
  return await new Promise((resolve) => {
    const worker = setupWorker(async (signature) => {
      resolve(signature);
    });
    worker.postMessage({
      params: { share, walletId, userId, tx, chain },
      functionType: 'SEND_TRANSACTION',
    });
  });
}

export async function signMessage(
  userId: string,
  walletId: string,
  share: string,
  message: string
): Promise<string> {
  return await new Promise((resolve) => {
    const worker = setupWorker(async (signature) => {
      resolve(signature);
    });
    worker.postMessage({
      params: { share, walletId, userId, message },
      functionType: 'SIGN_MESSAGE',
    });
  });
}
