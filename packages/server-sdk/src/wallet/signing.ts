import * as uuid from 'uuid';
import type { Ctx, SignatureRes } from '@getpara/core-sdk';
import { setupWorker } from '../workers/workerWrapper.js';

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
  return await new Promise(async resolve => {
    const workId = uuid.v4();
    const worker = await setupWorker(
      ctx,
      async sendTransactionRes => {
        resolve(sendTransactionRes);
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
  return await new Promise(async resolve => {
    const workId = uuid.v4();
    const worker = await setupWorker(
      ctx,
      async sendTransactionRes => {
        resolve(sendTransactionRes);
      },
      workId,
    );
    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
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
): Promise<SignatureRes> {
  return await new Promise(async resolve => {
    const workId = uuid.v4();
    const worker = await setupWorker(
      ctx,
      async signMessageRes => {
        resolve(signMessageRes);
      },
      workId,
    );
    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
      params: { share, walletId, userId, message },
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
  sessionCookie?: string,
): Promise<SignatureRes> {
  return await new Promise(async resolve => {
    const workId = uuid.v4();
    const worker = await setupWorker(
      ctx,
      async signMessageRes => {
        resolve(signMessageRes);
      },
      workId,
    );
    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
      params: { share, walletId, userId, base64Bytes },
      functionType: 'ED25519_SIGN',
      offloadMPCComputationURL: ctx.offloadMPCComputationURL,
      disableWorkers: ctx.disableWorkers,
      sessionCookie,
      disableWebSockets: ctx.disableWebSockets,
      wasmOverride: ctx.wasmOverride,
      workId,
    });
  });
}
