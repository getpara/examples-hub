import { setupWorker } from '../workers/workerWrapper';

import { distributeNewShare } from '../shares/shareDistribution';
import { Ctx } from '../definitions';

export function keygen(ctx: Ctx, userId: string): Promise<{
  shares: [string, string];
  walletId: string;
}> {
  return new Promise((resolve) => {
    const worker = setupWorker(async (res) => {
      await new Promise((resolve) => setTimeout(resolve, 6000));
      const signer = res.shares[0];
      await distributeNewShare(userId, res.walletId, signer);
      // TODO: remove this API call as isn't really necessary for functionality
      const capsuleShare = await ctx.capsuleClient.getCapsuleShare(
        userId,
        res.walletId
      );
      resolve({
        shares: [res.shares[0], capsuleShare.data.signer.signer],
        walletId: res.walletId,
      });
    });
    worker.postMessage({ ctx, params: { userId }, functionType: 'KEYGEN' });
  });
}
