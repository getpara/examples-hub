import axios from 'axios';
import {
  Ctx,
  Environment,
  getPortalBaseURL,
  initClient,
  mpcComputationClient,
  paraVersion,
  WalletType,
} from '@getpara/core-sdk';
import * as walletUtils from './walletUtils.js';

let rawWasm: any;

interface Message {
  env: Environment;
  apiKey?: string;
  cosmosPrefix?: string;
  offloadMPCComputationURL?: string;
  disableWorkers?: boolean;
  functionType: string;
  params: Record<string, any>;
  sessionCookie?: string;
  useDKLS?: boolean;
  disableWebSockets?: boolean;
  workId: string;
}

async function requestWasmWithRetries(ctx: Ctx, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(`${getPortalBaseURL(ctx, true, true)}/static/js/main.wasm`, { responseType: 'arraybuffer' });
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
      const { userId, secretKey, type = WalletType.EVM } = params;
      return walletUtils.keygen(ctx, userId, type, secretKey);
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
      const { email, partnerId, secretKey, type = WalletType.EVM } = params;
      let { pregenIdentifier, pregenIdentifierType } = params;
      if (email !== 'null' && email !== 'undefined' && email !== '' && email != null) {
        pregenIdentifier = email;
        pregenIdentifierType = 'EMAIL';
      }

      const keygenRes = await walletUtils.preKeygen(ctx, partnerId, pregenIdentifier, pregenIdentifierType, type, secretKey);
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
      let { pregenIdentifier, pregenIdentifierType } = params;
      if (email !== 'null' && email !== 'undefined' && email !== '' && email != null) {
        pregenIdentifier = email;
        pregenIdentifierType = 'EMAIL';
      }
      return walletUtils.ed25519PreKeygen(ctx, pregenIdentifier, pregenIdentifierType);
    }
    default: {
      throw new Error(`functionType: ${functionType} not supported`);
    }
  }
}

export async function handleMessage(e: { data: Message }): Promise<any> {
  const {
    env,
    apiKey,
    cosmosPrefix = 'cosmos',
    offloadMPCComputationURL,
    disableWorkers,
    sessionCookie,
    useDKLS,
    disableWebSockets,
    workId,
  } = e.data;
  const ctx = {
    env,
    apiKey,
    client: initClient({ env, version: paraVersion, apiKey, retrieveSessionCookie: () => sessionCookie }),
    offloadMPCComputationURL: offloadMPCComputationURL,
    mpcComputationClient: offloadMPCComputationURL
      ? mpcComputationClient.initClient(offloadMPCComputationURL, !!disableWorkers)
      : undefined,
    useDKLS,
    disableWebSockets: !!disableWebSockets,
    cosmosPrefix,
  };

  if (!ctx.offloadMPCComputationURL || ctx.useDKLS) {
    await loadWasm(ctx);
  }

  const result = await executeMessage(ctx, e.data);
  result.workId = workId;
  return result;
}
