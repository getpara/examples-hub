// ANY CHANGES TO THIS FILE REQUIRE A REBUILD OF THE WORKER
// FILE IN THE PORTAL!
// run `yarn build` to rebuild the worker file

import '../wasm/wasm_exec.js';
import * as walletUtils from './walletUtils.js';
import { Ctx, Environment, getPortalBaseURL, initClient, mpcComputationClient, paraVersion } from '@getpara/core-sdk';

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
  returnObject?: boolean;
  workId?: string;
}

let wasmLoaded = false;

async function loadWasm(ctx: Ctx, wasmOverride?: ArrayBuffer) {
  if (typeof self === 'undefined') {
    return;
  }

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
  const { functionType, params, returnObject } = message;

  switch (functionType) {
    case 'KEYGEN': {
      const { userId, secretKey, type = 'EVM' } = params;
      const keygenRes = await walletUtils.keygen(ctx, userId, type, secretKey);
      return keygenRes;
    }
    case 'SIGN_TRANSACTION': {
      const { share, walletId, userId, tx, chainId } = params;
      return withRetry(() => walletUtils.signTransaction(ctx, share, walletId, userId, tx, chainId));
    }
    case 'SEND_TRANSACTION': {
      const { share, walletId, userId, tx, chainId } = params;
      return withRetry(() => walletUtils.sendTransaction(ctx, share, walletId, userId, tx, chainId));
    }
    case 'SIGN_MESSAGE': {
      const { share, walletId, userId, message, cosmosSignDoc } = params;
      return withRetry(() => walletUtils.signMessage(ctx, share, walletId, userId, message, cosmosSignDoc));
    }
    case 'REFRESH': {
      const { share, walletId, userId, oldPartnerId, newPartnerId, keyShareProtocolId } = params;
      const { protocolId, signer } = await walletUtils.refresh(
        ctx,
        share,
        walletId,
        userId,
        oldPartnerId,
        newPartnerId,
        keyShareProtocolId,
      );
      return returnObject ? { protocolId, signer } : signer;
    }
    case 'PREKEYGEN': {
      const { email, partnerId, secretKey, type = 'EVM' } = params;
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
      return withRetry(() => walletUtils.ed25519Sign(ctx, share, userId, walletId, base64Bytes));
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

/**
 * Executes an operation with retry capabilities
 * @param operation The function to execute
 * @param maxRetries Maximum number of retries (default: 2)
 * @param timeoutMs Timeout in milliseconds (default: 10000)
 * @returns The result of the operation
 */
export async function withRetry<T>(operation: () => Promise<T>, maxRetries = 2, timeoutMs = 10000): Promise<T> {
  let retries = 0;

  while (true) {
    try {
      // Create a promise that resolves with the operation result
      const operationPromise = operation();

      // Create a promise that rejects after the timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        // Ensure the timeout is cleared if the operation completes before timeout
        operationPromise.finally(() => clearTimeout(timeoutId));
      });

      // Race between the operation and the timeout
      return await Promise.race([operationPromise, timeoutPromise]);
    } catch (error) {
      retries++;

      if (retries > maxRetries) {
        throw error;
      }

      console.warn(`Operation failed (attempt ${retries}/${maxRetries}), retrying...`, error);
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
    workId,
  } = e.data;
  if (!env) {
    // this means a message we didn't send was received and we want to ignore it
    return true;
  }
  const ctx = {
    env,
    apiKey,
    cosmosPrefix,
    client: initClient({
      env,
      version: paraVersion,
      apiKey,
      useFetchAdapter,
      retrieveSessionCookie: () => sessionCookie,
    }),
    offloadMPCComputationURL: offloadMPCComputationURL,
    mpcComputationClient: offloadMPCComputationURL
      ? mpcComputationClient.initClient(offloadMPCComputationURL, !!disableWorkers)
      : undefined,
    useDKLS,
    disableWebSockets: !!disableWebSockets,
    wasmOverride,
  };

  if (!wasmLoaded && (!ctx.offloadMPCComputationURL || ctx.useDKLS)) {
    await loadWasm(ctx, wasmOverride);
    if (global.initWasm) {
      await new Promise((resolve, reject) =>
        global.initWasm?.((err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        }),
      );
    }
    wasmLoaded = true;
  }

  const result = await executeMessage(ctx, e.data);
  if (workId) {
    result.workId = workId;
  }
  postMessage(result);
  return !!workId;
}
