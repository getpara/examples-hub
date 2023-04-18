import { setupWorker } from '../workers/workerWrapper';

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
  skipDistribute: boolean = false,
  customFunction: Function,
): Promise<{
  signer: string;
  walletId: string;
  recoveryShare: string | null;
}> {
  return new Promise((resolve) => {
    const worker = setupWorker(async (res) => {
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
    }, customFunction);
    worker.postMessage({
      env: ctx.env,
      params: { userId, secretKey },
      functionType: 'KEYGEN',
    });
  });
}

export function generatePaillierSecretKey(env: Environment): Promise<any> {
  return new Promise((resolve) => {
    const worker = setupWorker(async (res) => {
      resolve(res);
    });
    worker.postMessage({ env, functionType: 'PAILLIER' });
  });
}
