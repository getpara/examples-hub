import * as uuid from 'uuid';
import { waitUntilTrue, Ctx, TPregenIdentifierType } from '@getpara/core-sdk';
import { setupWorker } from '../workers/workerWrapper.js';
import { BackupKitEmailProps, WalletType } from '@getpara/user-management-client';

async function isKeygenComplete(ctx: Ctx, userId: string, walletId: string): Promise<boolean> {
  const wallets = await ctx.client.getWallets(userId);
  const wallet = wallets.data.wallets.find(w => w.id === walletId);
  return !!wallet.address;
}

async function isPreKeygenComplete(
  ctx: Ctx,
  pregenIdentifier: string,
  pregenIdentifierType: TPregenIdentifierType,
  walletId: string,
): Promise<boolean> {
  const wallets = await ctx.client.getPregenWallets({ [pregenIdentifierType]: [pregenIdentifier] });
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
  pregenIdentifierType: TPregenIdentifierType,
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
    if (pregenIdentifierType === 'EMAIL') {
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
  pregenIdentifierType: TPregenIdentifierType,
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
    if (pregenIdentifierType === 'EMAIL') {
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
