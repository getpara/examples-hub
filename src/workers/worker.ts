import '../wasm/wasm_exec.js';
import * as walletUtils from './walletUtils';
import { Ctx, Environment, getPortalBaseURL } from '../definitions';
import { initClient } from '../external/capsuleClient';

interface Message {
  env: Environment;
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
    case 'PAILLIER': {
      return walletUtils.generatePaillierSecretKey();
    }
    default: {
      throw new Error(`functionType: ${functionType} not supported`);
    }
  }
}


addEventListener('message', async (e: { data: Message }) => {
  const { env } = e.data;
  const ctx = {
    env,
    capsuleClient: initClient(env),
  };
  await loadWasm(ctx);

  function callCustomFunction(params: any): void {
    self.postMessage({
      functionType: 'CUSTOM',
      params,
    });
  }

  const result = await executeMessage(ctx, e.data, callCustomFunction);
  self.postMessage(result);
  self.close();
});
