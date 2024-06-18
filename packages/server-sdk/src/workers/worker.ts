import axios from 'axios';
import { parentPort } from 'worker_threads';
import { Ctx, Environment, getPortalBaseURL, initClient, mpcComputationClient } from '@usecapsule/core-sdk';
import * as walletUtils from './walletUtils.js';

let rawWasm: any;

interface Message {
  env: Environment;
  apiKey?: string;
  offloadMPCComputationURL?: string;
  disableWorkers?: boolean;
  functionType: string;
  params: Record<string, any>;
  sessionCookie?: string;
  useDKLS?: boolean;
  disableWebSockets?: boolean;
  workId: string;
}

parentPort.on('message', async (messageData: Message) => {
  await handleMessage({ data: messageData });
});

async function requestWasmWithRetries(ctx: Ctx, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(`${getPortalBaseURL(ctx, true)}/static/js/main.wasm`, { responseType: 'arraybuffer' });
    } catch (e) {
      if (i === retries - 1) {
        throw e;
      }
    }
  }
}

async function loadWasm(ctx: Ctx): Promise<void> {
  await import('../wasm/wasm_exec.js');
  global.WebSocket = require('ws');

  const goWasm = new global.Go();
  if (!rawWasm) {
    rawWasm = (await requestWasmWithRetries(ctx)).data;
  }
  const wasmBuffer = new Uint8Array(rawWasm);

  const webAssemblySource = await WebAssembly.instantiate(wasmBuffer, goWasm.importObject);
  goWasm.run(webAssemblySource.instance);
}

async function executeMessage(ctx: Ctx, message: Message): Promise<any> {
  const { functionType, params } = message;

  switch (functionType) {
    case 'KEYGEN': {
      const { userId, secretKey } = params;
      return walletUtils.keygen(ctx, userId, secretKey);
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
    case 'GET_PRIVATE_KEY': {
      const { share, walletId, userId } = params;
      return await walletUtils.getPrivateKey(ctx, share, walletId, userId);
    }
    case 'ED25519_KEYGEN': {
      const { userId } = params;
      return walletUtils.ed25519Keygen(ctx, userId);
    }
    case 'ED25519_SIGN': {
      const { share, walletId, userId, base64Bytes } = params;
      return walletUtils.ed25519Sign(ctx, share, userId, walletId, base64Bytes);
    }
    case 'ED25519_PREKEYGEN': {
      const { email } = params;
      return walletUtils.ed25519PreKeygen(ctx, email);
    }
    default: {
      throw new Error(`functionType: ${functionType} not supported`);
    }
  }
}

async function handleMessage(e: { data: Message }): Promise<void> {
  const { env, apiKey, offloadMPCComputationURL, disableWorkers, sessionCookie, useDKLS, disableWebSockets, workId } =
    e.data;
  const ctx = {
    env,
    apiKey,
    capsuleClient: initClient(env, apiKey, false, () => sessionCookie),
    offloadMPCComputationURL: offloadMPCComputationURL,
    mpcComputationClient: offloadMPCComputationURL
      ? mpcComputationClient.initClient(offloadMPCComputationURL, !!disableWorkers)
      : undefined,
    useDKLS,
    disableWebSockets: !!disableWebSockets,
  };

  if (!ctx.offloadMPCComputationURL || ctx.useDKLS) {
    await loadWasm(ctx);
  }

  const result = await executeMessage(ctx, e.data);
  result.workId = workId;
  parentPort.postMessage(result);
}
