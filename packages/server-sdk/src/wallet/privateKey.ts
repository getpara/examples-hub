import * as uuid from 'uuid';
import { Ctx } from '@usecapsule/core-sdk';
import { setupWorker } from '../workers/workerWrapper';

export async function getPrivateKey(
  ctx: Ctx,
  userId: string,
  walletId: string,
  share: string,
  sessionCookie?: string,
): Promise<string> {
  return await new Promise(async resolve => {
    const workId = uuid.v4();
    const worker = await setupWorker(async res => {
      resolve(res);
    }, workId);
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
      workId,
    });
  });
}
