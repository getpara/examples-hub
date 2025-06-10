import { Ctx, SignatureRes } from '@getpara/core-sdk';
import { setupWorker, SyncWorker } from '../workers/workerWrapper.js';
import * as uuid from 'uuid';

export async function signTransaction(
  ctx: Ctx,
  userId: string,
  walletId: string,
  share: string,
  tx: string,
  chainId: string,
  sessionCookie?: string,
  isDKLS?: boolean,
): Promise<SignatureRes> {
  return new Promise(async (resolve, reject) => {
    const workId = uuid.v4();
    let worker = null;

    worker = await setupWorker(
      ctx,
      async sendTransactionRes => {
        resolve(sendTransactionRes);
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
      params: { share, walletId, userId, tx, chainId },
      functionType: 'SIGN_TRANSACTION',
      offloadMPCComputationURL: ctx.offloadMPCComputationURL,
      disableWorkers: ctx.disableWorkers,
      sessionCookie,
      useDKLS: isDKLS,
      disableWebSockets: ctx.disableWebSockets,
      wasmOverride: ctx.wasmOverride,
      workId,
    });
  });
}

export async function sendTransaction(
  ctx: Ctx,
  userId: string,
  walletId: string,
  share: string,
  tx: string,
  chainId: string,
  sessionCookie?: string,
  isDKLS?: boolean,
): Promise<SignatureRes> {
  return new Promise(async (resolve, reject) => {
    const workId = uuid.v4();
    let worker = null;

    worker = await setupWorker(
      ctx,
      async sendTransactionRes => {
        resolve(sendTransactionRes);
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
      params: { share, walletId, userId, tx, chainId },
      functionType: 'SEND_TRANSACTION',
      offloadMPCComputationURL: ctx.offloadMPCComputationURL,
      disableWorkers: ctx.disableWorkers,
      sessionCookie,
      useDKLS: isDKLS,
      disableWebSockets: ctx.disableWebSockets,
      wasmOverride: ctx.wasmOverride,
      workId,
    });
  });
}

export async function signMessage(
  ctx: Ctx,
  userId: string,
  walletId: string,
  share: string,
  message: string,
  sessionCookie?: string,
  isDKLS?: boolean,
  cosmosSignDoc?: string,
): Promise<SignatureRes> {
  return new Promise(async (resolve, reject) => {
    const workId = uuid.v4();
    let worker: Worker | SyncWorker = null;

    worker = await setupWorker(
      ctx,
      async signMessageRes => {
        resolve(signMessageRes);
      },
      error => {
        console.error(`Worker error in signMessage for userId ${userId}, walletId ${walletId}:`, error);
        reject(error);
      },
      workId,
    );

    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
      cosmosPrefix: ctx.cosmosPrefix,
      params: { share, walletId, userId, message, cosmosSignDoc },
      functionType: 'SIGN_MESSAGE',
      offloadMPCComputationURL: ctx.offloadMPCComputationURL,
      disableWorkers: ctx.disableWorkers,
      sessionCookie,
      useDKLS: isDKLS,
      disableWebSockets: ctx.disableWebSockets,
      wasmOverride: ctx.wasmOverride,
      workId,
    });
  });
}

export async function ed25519Sign(
  ctx: Ctx,
  userId: string,
  walletId: string,
  share: string,
  base64Bytes: string,
  sessionCookie: string,
): Promise<SignatureRes> {
  return new Promise(async (resolve, reject) => {
    const workId = uuid.v4();
    let worker = null;

    worker = await setupWorker(
      ctx,
      async signMessageRes => {
        resolve(signMessageRes);
      },
      error => {
        console.error(`Worker error in ed25519Sign for userId ${userId}, walletId ${walletId}:`, error);
        reject(error);
      },
      workId,
    );

    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
      cosmosPrefix: ctx.cosmosPrefix,
      params: { share, walletId, userId, base64Bytes },
      functionType: 'ED25519_SIGN',
      disableWorkers: ctx.disableWorkers,
      sessionCookie,
      disableWebSockets: ctx.disableWebSockets,
      wasmOverride: ctx.wasmOverride,
      workId,
    });
  });
}
