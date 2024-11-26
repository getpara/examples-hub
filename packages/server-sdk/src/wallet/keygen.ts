import * as uuid from 'uuid';
import { waitUntilTrue, Ctx, PregenIdentifierType } from '@usecapsule/core-sdk';
import { setupWorker } from '../workers/workerWrapper.js';
import { BackupKitEmailProps, WalletType } from '@usecapsule/user-management-client';

async function isKeygenComplete(ctx: Ctx, userId: string, walletId: string): Promise<boolean> {
  const wallets = await ctx.capsuleClient.getWallets(userId);
  const wallet = wallets.data.wallets.find(w => w.id === walletId);
  return !!wallet.address;
}

async function isPreKeygenComplete(
  ctx: Ctx,
  pregenIdentifier: string,
  pregenIdentifierType: PregenIdentifierType,
  walletId: string,
): Promise<boolean> {
  const wallets = await ctx.capsuleClient.getPregenWallets(pregenIdentifier, pregenIdentifierType);
  const wallet = wallets.wallets.find(w => w.id === walletId);
  return !!wallet?.address;
}

export function keygen(
  ctx: Ctx,
  userId: string,
  type: WalletType,
  secretKey: string | null,
  skipDistribute = false,
  sessionCookie?: string,
  _emailProps: BackupKitEmailProps = {},
): Promise<{
  signer: string;
  walletId: string;
  recoveryShare: string | null;
}> {
  return new Promise(async resolve => {
    const workId = uuid.v4();
    const worker = await setupWorker(
      ctx,
      async res => {
        await waitUntilTrue(async () => isKeygenComplete(ctx, userId, res.walletId), 15000, 1000);
        if (skipDistribute) {
          resolve({
            signer: res.signer,
            walletId: res.walletId,
            recoveryShare: null,
          });
        }
      },
      workId,
    );
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
      workId,
    });
  });
}

export function preKeygen(
  ctx: Ctx,
  pregenIdentifier: string,
  pregenIdentifierType: PregenIdentifierType,
  type: WalletType,
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
    const workId = uuid.v4();
    const worker = await setupWorker(
      ctx,
      async res => {
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
      },
      workId,
    );
    const email: string | undefined = undefined;
    const params = { pregenIdentifier, pregenIdentifierType, secretKey, partnerId, email, type };
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
      workId,
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
    const workId = uuid.v4();
    const worker = await setupWorker(
      ctx,
      async res => {
        await waitUntilTrue(async () => isKeygenComplete(ctx, userId, res.walletId), 15000, 1000);
        resolve({
          signer: res.signer,
          walletId: res.walletId,
          recoveryShare: null,
        });
      },
      workId,
    );
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
      workId,
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
    const workId = uuid.v4();
    const worker = await setupWorker(
      ctx,
      async res => {
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
      },
      workId,
    );
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
      workId,
    });
  });
}
