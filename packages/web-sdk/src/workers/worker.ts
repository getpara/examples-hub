// ANY CHANGES TO THIS FILE REQUIRE A REBUILD OF THE WORKER
// FILE IN THE PORTAL!
// run `yarn build` to rebuild the worker file

import '../wasm/wasm_exec.js';
import * as walletUtils from './walletUtils.js';
import {
  Ctx,
  Environment,
  PregenIdentifierType,
  getPortalBaseURL,
  initClient,
  mpcComputationClient,
  capsuleVersion,
  WalletType,
} from '@usecapsule/core-sdk';

export interface Message {
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
  wasmOverride?: ArrayBuffer;
}

async function loadWasm(ctx: Ctx, wasmOverride?: ArrayBuffer) {
  // @ts-ignore
  const goWasm = new self.Go();
  let wasmArrayBuffer = wasmOverride;
  if (!wasmArrayBuffer) {
    if (process.env.DISABLE_WASM_FETCH === 'true') {
      throw new Error('fetching wasm file is disabled');
    }

    const fetchedWasm = await fetch(`${getPortalBaseURL(ctx)}/static/js/main.wasm`, { mode: 'cors' });
    wasmArrayBuffer = await fetchedWasm.arrayBuffer();
  }

  const newRes = await WebAssembly.instantiate(wasmArrayBuffer, goWasm.importObject);
  goWasm.run(newRes.instance);
}

async function executeMessage(ctx: Ctx, message: Message): Promise<any> {
  const { functionType, params } = message;

  switch (functionType) {
    case 'KEYGEN': {
      const { userId, secretKey, type = WalletType.EVM } = params;
      const keygenRes = await walletUtils.keygen(ctx, userId, type, secretKey);
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
      const { share, walletId, userId, message, cosmosSignDoc } = params;
      return walletUtils.signMessage(ctx, share, walletId, userId, message, cosmosSignDoc);
    }
    case 'REFRESH': {
      const { share, walletId, userId, oldPartnerId, newPartnerId } = params;
      return walletUtils.refresh(ctx, share, walletId, userId, oldPartnerId, newPartnerId);
    }
    case 'PREKEYGEN': {
      const { email, partnerId, secretKey, type = WalletType.EVM } = params;
      let { pregenIdentifier, pregenIdentifierType } = params;
      if (email !== 'null' && email !== 'undefined' && email !== '' && email != null) {
        pregenIdentifier = email;
        pregenIdentifierType = PregenIdentifierType.EMAIL;
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
        pregenIdentifierType = PregenIdentifierType.EMAIL;
      }
      return walletUtils.ed25519PreKeygen(ctx, pregenIdentifier, pregenIdentifierType);
    }
    default: {
      throw new Error(`functionType: ${functionType} not supported`);
    }
  }
}

export async function handleMessage(
  e: { data: Message },
  postMessage: (message: any) => void,
  useFetchAdapter?: boolean,
): Promise<boolean> {
  const {
    env,
    apiKey,
    cosmosPrefix = 'cosmos',
    offloadMPCComputationURL,
    disableWorkers,
    sessionCookie,
    useDKLS,
    disableWebSockets,
    wasmOverride,
  } = e.data;
  if (!env) {
    // this means a message we didn't send was received and we want to ignore it
    return true;
  }
  const ctx = {
    env,
    apiKey,
    cosmosPrefix,
    capsuleClient: initClient(env, capsuleVersion, apiKey, useFetchAdapter, () => sessionCookie),
    offloadMPCComputationURL: offloadMPCComputationURL,
    mpcComputationClient: offloadMPCComputationURL
      ? mpcComputationClient.initClient(offloadMPCComputationURL, !!disableWorkers)
      : undefined,
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
