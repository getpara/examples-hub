import axios from 'axios';
import { parentPort } from 'worker_threads';
import * as walletUtils from './walletUtils';
import { Ctx, Environment, getPortalBaseURL, initClient, mpcComputationClient } from '../core';

interface Message {
  env: Environment;
  apiKey?: string;
  offloadMPCComputationURL?: string;
  disableWorkers?: boolean;
  functionType: string;
  params: Record<string, any>;
  sessionCookie?: string;
  useDKLS?: boolean;
}

parentPort.on('message', async (messageData: Message | 'SHUTDOWN') => {
  if (messageData === 'SHUTDOWN') {
    // TODO: revisit to see if we can improve this
    setTimeout(() => {
      parentPort.close()
    }, 3000);
    return;
  }
  await handleMessage({ data: messageData });
});

async function loadWasm(ctx: Ctx): Promise<void> {
  require('../wasm/wasm_exec');
  global.WebSocket = require('ws');

  const goWasm = new global.Go();
  const wasmRes = await axios.get(`${getPortalBaseURL(ctx, true)}/static/js/main.wasm`, { responseType: 'arraybuffer' });
  const wasmBuffer = new Uint8Array(wasmRes.data);

  const webAssemblySource = await WebAssembly.instantiate(wasmBuffer, goWasm.importObject);
  goWasm.run(webAssemblySource.instance);
}

async function executeMessage(ctx: Ctx, message: Message, callCustomFunction: Function): Promise<any> {
  const { functionType, params } = message;

  switch (functionType) {
    case 'KEYGEN': {
      const { userId, secretKey } = params;
      return walletUtils.keygen(ctx, userId, secretKey, callCustomFunction);
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
    default: {
      throw new Error(`functionType: ${functionType} not supported`);
    }
  }
}

async function handleMessage(e: { data: Message }): Promise<void> {
  const { env, apiKey, offloadMPCComputationURL, disableWorkers, sessionCookie, useDKLS } = e.data;
  const ctx = {
    env,
    apiKey,
    capsuleClient: initClient(env, apiKey, false, () => sessionCookie),
    offloadMPCComputationURL: offloadMPCComputationURL,
    mpcComputationClient: offloadMPCComputationURL ? mpcComputationClient.initClient(offloadMPCComputationURL, !!disableWorkers) : undefined,
    useDKLS,
  };

  if (!ctx.offloadMPCComputationURL || ctx.useDKLS) {
    await loadWasm(ctx);
  }

  function callCustomFunction(params: any): void {
    const msg = {
      functionType: 'CUSTOM',
      params,
    };
    parentPort.postMessage(msg);
    return;
  }

  const result = await executeMessage(ctx, e.data, callCustomFunction);
  parentPort.postMessage(result);
}
