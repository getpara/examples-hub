// ANY CHANGES TO THIS FILE REQUIRE A REBUILD OF THE WORKER
// FILE IN THE PORTAL!
// run `yarn build` to rebuild the worker file

import '../wasm/wasm_exec.js';
import * as walletUtils from './walletUtils.js';
import {
  Ctx,
  Environment,
  getPortalBaseURL,
  initClient,
  mpcComputationClient,
} from '@usecapsule/core-sdk';

export interface Message {
  env: Environment;
  apiKey?: string;
  offloadMPCComputationURL?: string;
  disableWorkers?: boolean;
  functionType: string;
  params: Record<string, any>;
  sessionCookie?: string;
  useDKLS?: boolean;
  disableWebSockets?: boolean;
  wasmOverride?: ArrayBuffer;
}

/* eslint-disable no-restricted-globals */
async function loadWasm(ctx: Ctx, wasmOverride?: ArrayBuffer) {
  // @ts-ignore
  const goWasm = new self.Go();
  let wasmArrayBuffer = wasmOverride;
  if (!wasmArrayBuffer) {
    if (process.env.DISABLE_WASM_FETCH === 'true') {
      throw new Error('fetching wasm file is disabled');
    }

    const fetchedWasm = await fetch(
      `${getPortalBaseURL(ctx)}/static/js/main.wasm`,
      { mode: 'cors' },
    );
    wasmArrayBuffer = await fetchedWasm.arrayBuffer();
  }

  const newRes = await WebAssembly.instantiate(
    wasmArrayBuffer,
    goWasm.importObject
  );
  goWasm.run(newRes.instance);
}

async function executeMessage(ctx: Ctx, message: Message): Promise<any> {
  const { functionType, params } = message;

  switch (functionType) {
    case 'KEYGEN': {
      const { userId, secretKey } = params;
      const keygenRes = await walletUtils.keygen(ctx, userId, secretKey);
      return keygenRes;
    }
    case 'SIGN_TRANSACTION': {
      const { share, walletId, userId, tx, chainId } = params;
      return walletUtils.signTransaction(ctx, share, walletId, userId, tx, chainId);
    }
    case 'SEND_TRANSACTION': {
      const { share, walletId, userId, tx, chainId } = params;
      return walletUtils.sendTransaction(ctx, share, walletId, userId, tx, chainId);
    }
    case 'SIGN_MESSAGE': {
      const { share, walletId, userId, message } = params;
      return walletUtils.signMessage(ctx, share, walletId, userId, message);
    }
    case 'REFRESH': {
      const { share, walletId, userId } = params;
      return walletUtils.refresh(ctx, share, walletId, userId);
    }
    case 'PREKEYGEN': {
      const { partnerId, secretKey, email } = params;
      const keygenRes = await walletUtils.preKeygen(ctx, partnerId, email, secretKey);
      return keygenRes;
    }
    default: {
      throw new Error(`functionType: ${functionType} not supported`);
    }
  }
}

export async function handleMessage(e: { data: Message }, postMessage: (message: any) => void, useFetchAdapter?: boolean): Promise<boolean> {
  const { env, apiKey, offloadMPCComputationURL, disableWorkers, sessionCookie, useDKLS, disableWebSockets, wasmOverride } = e.data;
  if (!env) {
    // this means a message we didn't send was received and we want to ignore it
    return true;
  }
  const ctx = {
    env,
    apiKey,
    capsuleClient: initClient(env, apiKey, useFetchAdapter, () => sessionCookie),
    offloadMPCComputationURL: offloadMPCComputationURL,
    mpcComputationClient: offloadMPCComputationURL ? mpcComputationClient.initClient(offloadMPCComputationURL, !!disableWorkers) : undefined,
    useDKLS,
    disableWebSockets: !!disableWebSockets,
    wasmOverride,
  };

  if (!ctx.offloadMPCComputationURL || ctx.useDKLS) {
    await loadWasm(ctx, wasmOverride);
  }

  const result = await executeMessage(ctx, e.data);
  postMessage(result);
  return false;
}
