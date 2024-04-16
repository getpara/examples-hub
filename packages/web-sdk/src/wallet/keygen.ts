import { setupWorker } from '../workers/workerWrapper.js';

import { Ctx, distributeNewShare, waitUntilTrue } from '@usecapsule/core-sdk';
import { BackupKitEmailProps } from '@usecapsule/user-management-client';

async function isKeygenComplete(
  ctx: Ctx,
  userId: string,
  walletId: string,
): Promise<boolean> {
  const wallets = await ctx.capsuleClient.getWallets(userId);
  const wallet = wallets.data.wallets.find((w) => w.id === walletId);
  return !!wallet.address;
}

async function isPreKeygenComplete(
  ctx: Ctx,
  email: string,
  walletId: string,
): Promise<boolean> {
  const wallets = await ctx.capsuleClient.getPregenWallets(email);
  const wallet = wallets.wallets.find((w) => w.id === walletId);
  return !!wallet.address;
}

export function keygen(
  ctx: Ctx,
  userId: string,
  secretKey: string | null,
  skipDistribute = false,
  sessionCookie?: string,
  emailProps: BackupKitEmailProps = {}
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
        false, 
        emailProps
      );
      resolve({
        signer: res.signer,
        walletId: res.walletId,
        recoveryShare,
      });
      worker.terminate();
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
      disableWebSockets: ctx.disableWebSockets,
      wasmOverride: ctx.wasmOverride,
    });
  });
}

export function preKeygen(
  ctx: Ctx,
  email: string,
  secretKey: string | null,
  skipDistribute = false,
  partnerId: string,
  sessionCookie?: string,
): Promise<{
  signer: string;
  walletId: string;
  recoveryShare: string | null;
}> {
  return new Promise(async (resolve) => {
    const worker = await setupWorker(ctx, async (res) => {
      await waitUntilTrue(
        async () => isPreKeygenComplete(ctx, email, res.walletId),
        15000,
        1000,
      );

      resolve({
        signer: res.signer,
        walletId: res.walletId,
        recoveryShare: null,
      });
      worker.terminate();
    });
    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
      params: { email, secretKey, partnerId },
      functionType: 'PREKEYGEN',
      offloadMPCComputationURL: ctx.offloadMPCComputationURL,
      disableWorkers: ctx.disableWorkers,
      sessionCookie,
      useDKLS: ctx.useDKLS,
      disableWebSockets: ctx.disableWebSockets,
      wasmOverride: ctx.wasmOverride,
    });
  });
}