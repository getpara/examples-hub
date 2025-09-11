import { setupWorker, SyncWorker } from '../workers/workerWrapper.js';
import { Ctx, distributeNewShare, waitUntilTrue, TPregenIdentifierType } from '@getpara/core-sdk';
import { BackupKitEmailProps, TWalletType } from '@getpara/user-management-client';
import * as uuid from 'uuid';

async function isKeygenComplete(ctx: Ctx, userId: string, walletId: string): Promise<boolean> {
  const wallets = await ctx.client.getWallets(userId);
  const wallet = wallets.data.wallets.find(w => w.id === walletId);
  return !!wallet.address;
}

async function isRefreshComplete(
  ctx: Ctx,
  userId: string,
  walletId: string,
  partnerId?: string,
  protocolId?: string,
): Promise<boolean> {
  const { isDone } = await ctx.client.isRefreshDone(userId, walletId, partnerId, protocolId);
  return isDone;
}

async function isPreKeygenComplete(
  ctx: Ctx,
  pregenIdentifier: string,
  pregenIdentifierType: TPregenIdentifierType,
  walletId: string,
): Promise<boolean> {
  const wallets = await ctx.client.getPregenWallets({ [pregenIdentifierType]: [pregenIdentifier] });
  const wallet = wallets.wallets.find(w => w.id === walletId);
  return !!wallet.address;
}

export function keygen(
  ctx: Ctx,
  userId: string,
  type: Exclude<TWalletType, 'SOLANA'>,
  secretKey: string | null,
  skipDistribute = false,
  sessionCookie?: string,
  emailProps: BackupKitEmailProps = {},
): Promise<{
  signer: string;
  walletId: string;
  recoveryShare: string | null;
}> {
  return new Promise(async (resolve, reject) => {
    const workId = uuid.v4();
    let worker: Worker | SyncWorker | null = null;

    worker = await setupWorker(
      ctx,
      async res => {
        await waitUntilTrue(async () => isKeygenComplete(ctx, userId, res.walletId), 15000, 1000);
        if (skipDistribute) {
          resolve({
            signer: res.signer,
            walletId: res.walletId,
            recoveryShare: null,
          });
          return;
        }

        const recoveryShare = await distributeNewShare({
          ctx,
          userId,
          walletId: res.walletId,
          userShare: res.signer,
          emailProps,
          isEnclaveUser: false,
          walletScheme: 'DKLS', // since `isEnclaveUser` is false, we can use `DKLS` here as it won't be used
        });
        resolve({
          signer: res.signer,
          walletId: res.walletId,
          recoveryShare,
        });
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
  type: Exclude<TWalletType, 'SOLANA'>,
  secretKey: string | null,
  _skipDistribute = false,
  partnerId: string,
  sessionCookie?: string,
): Promise<{
  signer: string;
  walletId: string;
  recoveryShare: string | null;
}> {
  return new Promise(async (resolve, reject) => {
    const workId = uuid.v4();
    let worker: Worker | SyncWorker | null = null;

    worker = await setupWorker(
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
      error => {
        reject(error);
      },
      workId,
    );

    const email: string | undefined = undefined;
    const params = { pregenIdentifier, pregenIdentifierType, type, secretKey, partnerId, email };
    if (pregenIdentifierType === 'EMAIL') {
      params.email = pregenIdentifier;
    }
    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
      cosmosPrefix: ctx.cosmosPrefix,
      params,
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

export function refresh(
  ctx: Ctx,
  sessionCookie: string,
  userId: string,
  walletId: string,
  share: string,
  oldPartnerId?: string,
  newPartnerId?: string,
  keyShareProtocolId?: string,
): Promise<{
  signer: string;
  protocolId: string;
}> {
  return new Promise(async (resolve, reject) => {
    const workId = uuid.v4();
    let worker: Worker | SyncWorker | null = null;

    worker = await setupWorker(
      ctx,
      async res => {
        /* v8 ignore next 4 */
        if (!(await waitUntilTrue(async () => isRefreshComplete(ctx, userId, walletId, newPartnerId), 15000, 1000))) {
          reject(new Error('refresh failed'));
          return;
        }

        const { protocolId, signer } = res;

        resolve({
          signer,
          protocolId,
        });
      },
      error => {
        reject(error);
      },
      workId,
    );

    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
      params: { userId, walletId, share, oldPartnerId, newPartnerId, keyShareProtocolId },
      functionType: 'REFRESH',
      disableWorkers: ctx.disableWorkers,
      sessionCookie,
      useDKLS: ctx.useDKLS,
      disableWebSockets: ctx.disableWebSockets,
      wasmOverride: ctx.wasmOverride,
      returnObject: true,
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
  return new Promise(async (resolve, reject) => {
    const workId = uuid.v4();
    let worker: Worker | SyncWorker | null = null;

    worker = await setupWorker(
      ctx,
      async res => {
        await waitUntilTrue(async () => isKeygenComplete(ctx, userId, res.walletId), 15000, 1000);
        resolve({
          signer: res.signer,
          walletId: res.walletId,
          recoveryShare: null,
        });
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
  return new Promise(async (resolve, reject) => {
    const workId = uuid.v4();
    let worker: Worker | SyncWorker | null = null;

    worker = await setupWorker(
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
      error => {
        reject(error);
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
      params,
      functionType: 'ED25519_PREKEYGEN',
      disableWorkers: ctx.disableWorkers,
      sessionCookie,
      disableWebSockets: ctx.disableWebSockets,
      wasmOverride: ctx.wasmOverride,
      workId,
    });
  });
}

export async function initializeWorker(ctx: Ctx): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const workId = uuid.v4();

    const worker = await setupWorker(
      ctx,
      async () => {
        resolve();
      },
      error => {
        reject(error);
      },
      workId,
    );

    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
      functionType: 'INIT',
      workId,
    });
  });
}
