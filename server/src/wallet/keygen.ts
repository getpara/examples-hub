import { distributeNewShare, Ctx } from '../core';
import { waitUntilTrue } from '../core/utils/pollingUtils';
import { setupWorker } from '../workers/workerWrapper';

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
  sessionCookie?: string,
): Promise<{
  signer: string;
  walletId: string;
  recoveryShare: string | null;
}> {
  return new Promise(async (resolve) => {
    const worker = await setupWorker(async (res) => {
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
    });
    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
      params: { userId, secretKey },
      functionType: 'KEYGEN',
      offloadMPCComputationURL: ctx.offloadMPCComputationURL,
      disableWorkers: ctx.disableWorkers,
      sessionCookie,
      useDKLS: ctx.useDKLS,
    });
  });
}
