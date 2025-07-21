import * as uuid from 'uuid';
import { waitUntilTrue, Ctx, TPregenIdentifierType } from '@getpara/core-sdk';
import { setupWorker } from '../workers/workerWrapper.js';
import { BackupKitEmailProps, TWalletType } from '@getpara/user-management-client';

export async function isKeygenComplete(ctx: Ctx, userId: string, walletId: string): Promise<boolean> {
  const wallets = await ctx.client.getWallets(userId);
  const wallet = wallets.data.wallets.find(w => w.id === walletId);
  return !!wallet?.address;
}

export async function isPreKeygenComplete(
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
  type: TWalletType,
  secretKey: string | null,
  sessionCookie?: string,
  _emailProps: BackupKitEmailProps = {},
): Promise<{
  signer: string;
  walletId: string;
  recoveryShare: string | null;
}> {
  return new Promise(async (resolve, reject) => {
    const workId = uuid.v4();

    try {
      const worker = await setupWorker(
        ctx,
        async res => {
          try {
            await waitUntilTrue(async () => isKeygenComplete(ctx, userId, res.walletId), 15000, 1000);
            resolve({
              signer: res.signer,
              walletId: res.walletId,
              recoveryShare: null,
            });
          } catch (error) {
            reject(error);
          }
        },
        error => {
          reject(error);
        },
        workId,
        {
          userId,
          type,
          functionType: 'KEYGEN',
          disableWorkers: ctx.disableWorkers,
          disableWebSockets: ctx.disableWebSockets,
        },
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
    } catch (error) {
      reject(error);
    }
  });
}

export function preKeygen(
  ctx: Ctx,
  pregenIdentifier: string,
  pregenIdentifierType: TPregenIdentifierType,
  type: TWalletType,
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

    try {
      const email: string | undefined = undefined;
      const params = { pregenIdentifier, pregenIdentifierType, secretKey, partnerId, email, type };
      if (pregenIdentifierType === 'EMAIL') {
        params.email = pregenIdentifier;
      }

      const worker = await setupWorker(
        ctx,
        async res => {
          try {
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
          } catch (error) {
            reject(error);
          }
        },
        error => {
          reject(error);
        },
        workId,
        {
          ...params,
          secretKey: null,
          functionType: 'PREKEYGEN',
          disableWorkers: ctx.disableWorkers,
          disableWebSockets: ctx.disableWebSockets,
        },
      );

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
    } catch (error) {
      reject(error);
    }
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

    try {
      const worker = await setupWorker(
        ctx,
        async res => {
          try {
            await waitUntilTrue(async () => isKeygenComplete(ctx, userId, res.walletId), 15000, 1000);
            resolve({
              signer: res.signer,
              walletId: res.walletId,
              recoveryShare: null,
            });
          } catch (error) {
            reject(error);
          }
        },
        error => {
          reject(error);
        },
        workId,
        {
          userId,
          functionType: 'ED25519_KEYGEN',
          disableWorkers: ctx.disableWorkers,
          disableWebSockets: ctx.disableWebSockets,
        },
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
    } catch (error) {
      reject(error);
    }
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

    try {
      const email: string | undefined = undefined;
      const params = { pregenIdentifier, pregenIdentifierType, email };
      if (pregenIdentifierType === 'EMAIL') {
        params.email = pregenIdentifier;
      }

      const worker = await setupWorker(
        ctx,
        async res => {
          try {
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
          } catch (error) {
            reject(error);
          }
        },
        error => {
          reject(error);
        },
        workId,
        {
          params,
          functionType: 'ED25519_PREKEYGEN',
          disableWorkers: ctx.disableWorkers,
          disableWebSockets: ctx.disableWebSockets,
        },
      );

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
    } catch (error) {
      reject(error);
    }
  });
}

export async function initializeWorker(ctx: Ctx): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const workId = uuid.v4();

    try {
      const worker = await setupWorker(
        ctx,
        async () => {
          resolve();
        },
        error => {
          reject(error);
        },
        workId,
        {
          functionType: 'INIT',
          disableWorkers: ctx.disableWorkers,
          disableWebSockets: ctx.disableWebSockets,
        },
      );

      worker.postMessage({
        env: ctx.env,
        apiKey: ctx.apiKey,
        functionType: 'INIT',
        workId,
      });
    } catch (error) {
      reject(error);
    }
  });
}
