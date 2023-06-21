// ANY CHANGES TO THIS FILE REQUIRE A REBUILD OF THE WORKER
// FILE IN THE PORTAL!
// run `yarn build-webpack` to rebuild the worker file

import '../wasm/wasm_exec.js';
import * as walletUtils from './walletUtils';
import { Ctx, Environment, getPortalBaseURL } from '../definitions';
import { initClient } from '../external/capsuleClient';
import * as mpcComputationClient from '../external/mpcComputationClient';

interface Message {
  env: Environment;
  apiKey?: string;
  offloadMPCComputationURL?: string;
  disableWorkers?: boolean;
  functionType: string;
  params: Record<string, any>;
}

/* eslint-disable no-restricted-globals */
async function loadWasm(ctx: Ctx) {
  // @ts-ignore
  const goWasm = new self.Go();
  const newRes = await WebAssembly.instantiateStreaming(
    fetch(`${getPortalBaseURL(ctx)}/static/js/main.wasm`),
    goWasm.importObject
  );
  goWasm.run(newRes.instance);
}

async function executeMessage(ctx: Ctx, message: Message, callCustomFunction: Function): Promise<any> {
  const { functionType, params } = message;

  switch (functionType) {
    case 'KEYGEN': {
      const { userId, secretKey } = params;
      const keygenRes = await walletUtils.keygen(ctx, userId, secretKey, callCustomFunction);
      return keygenRes;
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
    case 'BLUM_PRIME': {
      return walletUtils.generateBlumPrime();
    }
    default: {
      throw new Error(`functionType: ${functionType} not supported`);
    }
  }
}

export async function handleMessage(e: { data: Message }, postMessage: (message: any) => void, useFetchAdapter?: boolean): Promise<boolean> {
  const { env, apiKey, offloadMPCComputationURL, disableWorkers } = e.data;
  if (!env) {
    // this means a message we didn't send was received and we want to ignore it
    return true;
  }
  const ctx = {
    env,
    apiKey,
    capsuleClient: initClient(env, apiKey, useFetchAdapter),
    offloadMPCComputationURL: offloadMPCComputationURL,
    mpcComputationClient: offloadMPCComputationURL ? mpcComputationClient.initClient(offloadMPCComputationURL, !!disableWorkers) : undefined,
  };

  if (!ctx.offloadMPCComputationURL) {
    await loadWasm(ctx);
  }

  function callCustomFunction(params: any): void {
    postMessage({
      functionType: 'CUSTOM',
      params,
    });
  }

  const result = await executeMessage(ctx, e.data, callCustomFunction);
  postMessage(result);
  return false;
}

addEventListener('message', async (e: { data: Message }) => {
  const skipClose = await handleMessage(e, self.postMessage);
  if (skipClose) {
    return;
  }
  self.close();
});
