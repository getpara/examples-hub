import { Ctx } from '@getpara/core-sdk';
import { setupWorker } from '../workers/workerWrapper.js';
import * as uuid from 'uuid';

export async function getPrivateKey(
  ctx: Ctx,
  userId: string,
  walletId: string,
  share: string,
  sessionCookie?: string,
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const workId = uuid.v4();
    let worker = null;

    worker = await setupWorker(
      ctx,
      async res => {
        // just a fallback for now until we update the worker to return the private key field
        // TODO: remove this once the worker is updated and switch to just resolve(res.privateKey)
        resolve(res?.privateKey || res);
      },
      error => {
        reject(error);
      },
      workId,
    );

    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
      cosmosPrefix: ctx.cosmosPrefix,
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
