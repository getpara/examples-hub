import { setupWorker } from '../workers/workerWrapper.js';
import { PregenIdentifierType } from '@usecapsule/core-sdk';

import { Ctx, distributeNewShare, waitUntilTrue } from '@usecapsule/core-sdk';
import { BackupKitEmailProps, WalletType } from '@usecapsule/user-management-client';

async function isKeygenComplete(ctx: Ctx, userId: string, walletId: string): Promise<boolean> {
  const wallets = await ctx.capsuleClient.getWallets(userId);
  const wallet = wallets.data.wallets.find(w => w.id === walletId);
  return !!wallet.address;
}

async function isRefreshComplete(ctx: Ctx, userId: string, walletId: string, partnerId?: string): Promise<boolean> {
  const { isDone } = await ctx.capsuleClient.isRefreshDone(userId, walletId, partnerId);
  return isDone;
}

async function isPreKeygenComplete(
  ctx: Ctx,
  pregenIdentifier: string,
  pregenIdentifierType: PregenIdentifierType,
  walletId: string,
): Promise<boolean> {
  const wallets = await ctx.capsuleClient.getPregenWallets(pregenIdentifier, pregenIdentifierType);
  const wallet = wallets.wallets.find(w => w.id === walletId);
  return !!wallet.address;
}

export function keygen(
  ctx: Ctx,
  userId: string,
  type: Exclude<WalletType, WalletType.SOLANA>,
  secretKey: string | null,
  skipDistribute = false,
  sessionCookie?: string,
  emailProps: BackupKitEmailProps = {},
): Promise<{
  signer: string;
  walletId: string;
  recoveryShare: string | null;
}> {
  return new Promise(async resolve => {
    const worker = await setupWorker(ctx, async res => {
      await waitUntilTrue(async () => isKeygenComplete(ctx, userId, res.walletId), 15000, 1000);
      if (skipDistribute) {
        resolve({
          signer: res.signer,
          walletId: res.walletId,
          recoveryShare: null,
        });
        worker.terminate();
        return;
      }

      const recoveryShare = await distributeNewShare(ctx, userId, res.walletId, res.signer, false, emailProps);
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
      cosmosPrefix: ctx.cosmosPrefix,
      params: { userId, secretKey, type },
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
  pregenIdentifier: string,
  pregenIdentifierType: PregenIdentifierType,
  type: Exclude<WalletType, WalletType.SOLANA>,
  secretKey: string | null,
  _skipDistribute = false,
  partnerId: string,
  sessionCookie?: string,
): Promise<{
  signer: string;
  walletId: string;
  recoveryShare: string | null;
}> {
  return new Promise(async resolve => {
    const worker = await setupWorker(ctx, async res => {
      await waitUntilTrue(
        async () => isPreKeygenComplete(ctx, pregenIdentifier, pregenIdentifierType, res.walletId),
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
    const email: string | undefined = undefined;
    const params = { pregenIdentifier, pregenIdentifierType, type, secretKey, partnerId, email };
    if (pregenIdentifierType === PregenIdentifierType.EMAIL) {
      params.email = pregenIdentifier;
    }
    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
      cosmosPrefix: ctx.cosmosPrefix,
      params: params,
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

export function refresh(
  ctx: Ctx,
  sessionCookie: string,
  userId: string,
  walletId: string,
  share: string,
  oldPartnerId?: string,
  newPartnerId?: string,
): Promise<{
  signer: string;
}> {
  return new Promise(async resolve => {
    const worker = await setupWorker(ctx, async res => {
      await waitUntilTrue(async () => isRefreshComplete(ctx, userId, walletId, newPartnerId), 15000, 1000);

      resolve({
        signer: res,
      });
      worker.terminate();
    });
    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
      params: { userId, walletId, share, oldPartnerId, newPartnerId },
      functionType: 'REFRESH',
      disableWorkers: ctx.disableWorkers,
      sessionCookie,
      useDKLS: ctx.useDKLS,
      disableWebSockets: ctx.disableWebSockets,
      wasmOverride: ctx.wasmOverride,
    });
  });
}

export function ed25519Keygen(
  ctx: Ctx,
  userId: string,
  sessionCookie?: string,
  _emailProps: BackupKitEmailProps = {},
): Promise<{
  signer: string;
  walletId: string;
  recoveryShare: string | null;
}> {
  return new Promise(async resolve => {
    const worker = await setupWorker(ctx, async res => {
      await waitUntilTrue(async () => isKeygenComplete(ctx, userId, res.walletId), 15000, 1000);
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
      cosmosPrefix: ctx.cosmosPrefix,
      params: { userId },
      functionType: 'ED25519_KEYGEN',
      disableWorkers: ctx.disableWorkers,
      sessionCookie,
      disableWebSockets: ctx.disableWebSockets,
      wasmOverride: ctx.wasmOverride,
    });
  });
}

export function ed25519PreKeygen(
  ctx: Ctx,
  pregenIdentifier: string,
  pregenIdentifierType: PregenIdentifierType,
  sessionCookie?: string,
): Promise<{
  signer: string;
  walletId: string;
  recoveryShare: string | null;
}> {
  return new Promise(async resolve => {
    const worker = await setupWorker(ctx, async res => {
      await waitUntilTrue(
        async () => isPreKeygenComplete(ctx, pregenIdentifier, pregenIdentifierType, res.walletId),
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

    const email: string | undefined = undefined;
    const params = { pregenIdentifier, pregenIdentifierType, email };
    if (pregenIdentifierType === PregenIdentifierType.EMAIL) {
      params.email = pregenIdentifier;
    }
    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
      cosmosPrefix: ctx.cosmosPrefix,
      params: params,
      functionType: 'ED25519_PREKEYGEN',
      disableWorkers: ctx.disableWorkers,
      sessionCookie,
      disableWebSockets: ctx.disableWebSockets,
      wasmOverride: ctx.wasmOverride,
    });
  });
}
