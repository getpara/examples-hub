import { Ctx, SignatureRes } from '@usecapsule/core-sdk';
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
    const worker = await setupWorker(ctx, async sendTransactionRes => {
      resolve(sendTransactionRes);
      worker.terminate();
    });
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
    const worker = await setupWorker(ctx, async sendTransactionRes => {
      resolve(sendTransactionRes);
      worker.terminate();
    });
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
  return await new Promise(async resolve => {
    const worker = await setupWorker(ctx, async signMessageRes => {
      resolve(signMessageRes);
      worker.terminate();
    });
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
  return await new Promise(async resolve => {
    const worker = await setupWorker(ctx, async signMessageRes => {
      resolve(signMessageRes);
      worker.terminate();
    });
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
    });
  });
}
