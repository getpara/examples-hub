import { setupWorker, SyncWorker } from '../workers/workerWrapper';

import { distributeNewShare } from '../shares/shareDistribution';
import { Ctx, Environment } from '../definitions';
import { waitUntilTrue } from '../utils/pollingUtils';

async function isKeygenComplete(
  ctx: Ctx,
  userId: string,
  walletId: string,
): Promise<boolean> {
  const wallets = await ctx.capsuleClient.getWallets(userId);
  const wallet = wallets.data.wallets.find((w) => w.id === walletId);
  return !!wallet.address;
}

export function keygen(
  ctx: Ctx,
  userId: string,
  secretKey: string | null,
  skipDistribute = false,
  customFunction: (params?: any) => void,
  sessionCookie?: string,
): Promise<{
  signer: string;
  walletId: string;
  recoveryShare: string | null;
}> {
  return new Promise(async (resolve) => {
    const worker = await setupWorker(ctx, async (res) => {
      await waitUntilTrue(
        async () => isKeygenComplete(ctx, userId, res.walletId),
        15000,
        1000,
      );
      if (skipDistribute) {
        resolve({
          signer: res.signer,
          walletId: res.walletId,
          recoveryShare: null,
        });
        worker.terminate();
        return;
      }

      const recoveryShare = await distributeNewShare(
        ctx,
        userId,
        res.walletId,
        res.signer,
      );
      resolve({
        signer: res.signer,
        walletId: res.walletId,
        recoveryShare,
      });
      worker.terminate();
    }, customFunction);
    worker.postMessage({
      env: ctx.env,
      params: { userId, secretKey },
      functionType: 'KEYGEN',
      offloadMPCComputationURL: ctx.offloadMPCComputationURL,
      disableWorkers: ctx.disableWorkers,
      sessionCookie,
    });
  });
}

function getNumWorkers(ctx): number {
  if (ctx.disableWorkers) {
    return 2
  }
  return navigator.hardwareConcurrency || 4;
}

export async function generateBlumPrimes(ctx: Ctx): Promise<{ p: string; q: string; }> {
  const numWorkers = getNumWorkers(ctx);
  const workerResponses: Promise<any>[] = [];
  const workers: (Worker | SyncWorker)[] = [];

  for (let i = 0; i < numWorkers; i++) {
    workerResponses.push(new Promise(async (resolve) => {
      const worker = await setupWorker(ctx, async (res) => {
        resolve({ res, index: i });
      });

      worker.postMessage({ env: ctx.env, functionType: 'BLUM_PRIME' });
      workers.push(worker);
    }));
  }

  const { res: p, index } = await Promise.race(workerResponses);
  const newWorkerResponses = [...workerResponses.slice(0, index), ...workerResponses.slice(index + 1)];
  const { res: q } = await Promise.race(newWorkerResponses);
  workers.forEach((w) => w.terminate());
  return { p, q };
}
