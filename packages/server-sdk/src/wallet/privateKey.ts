import * as uuid from 'uuid';
import { Ctx } from '@getpara/core-sdk';
import { setupWorker } from '../workers/workerWrapper.js';

export async function getPrivateKey(
  ctx: Ctx,
  userId: string,
  walletId: string,
  share: string,
  sessionCookie?: string,
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const workId = uuid.v4();

    try {
      const worker = await setupWorker(
        ctx,
        async res => {
          resolve(res.privateKey);
        },
        error => {
          reject(error);
        },
        workId,
        {
          params: { walletId, userId },
          functionType: 'GET_PRIVATE_KEY',
          disableWorkers: ctx.disableWorkers,
          disableWebSockets: ctx.disableWebSockets,
        },
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
    } catch (error) {
      reject(error);
    }
  });
}
