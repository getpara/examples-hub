import { Ctx, SignatureRes } from '../core';
import { setupWorker } from '../workers/workerWrapper';

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
  return await new Promise(async (resolve) => {
    const worker = await setupWorker(async (sendTransactionRes) => {
      resolve(sendTransactionRes);
    });
    worker.postMessage({
      env: ctx.env,
      apiKey: ctx.apiKey,
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
  return await new Promise(async (resolve) => {
    const worker = await setupWorker(async (sendTransactionRes) => {
      resolve(sendTransactionRes);
    });
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
  return await new Promise(async (resolve) => {
    const worker = await setupWorker(async (signMessageRes) => {
      resolve(signMessageRes);
    });
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
    });
  });
}
