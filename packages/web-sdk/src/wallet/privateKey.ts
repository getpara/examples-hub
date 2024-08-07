import { Ctx } from '@usecapsule/core-sdk';
import { setupWorker } from '../workers/workerWrapper.js';

export async function getPrivateKey(
  ctx: Ctx,
  userId: string,
  walletId: string,
  share: string,
  sessionCookie?: string,
): Promise<string> {
  return await new Promise(async resolve => {
    const worker = await setupWorker(ctx, async res => {
      resolve(res);
      worker.terminate();
    });
    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
      params: { share, walletId, userId },
      functionType: 'GET_PRIVATE_KEY',
      offloadMPCComputationURL: ctx.offloadMPCComputationURL,
      disableWorkers: ctx.disableWorkers,
      sessionCookie,
      useDKLS: ctx.useDKLS,
      disableWebSockets: ctx.disableWebSockets,
      wasmOverride: ctx.wasmOverride,
    });
  });
}
