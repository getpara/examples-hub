import '../wasm/wasm_exec.js';
import * as walletUtils from './walletUtils';
import { Ctx, getPortalBaseURL } from '../definitions';

interface Message {
  ctx: Ctx;
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

async function executeMessage(message: Message): Promise<any> {
  const { ctx, functionType, params } = message;
  switch (functionType) {
    case 'KEYGEN': {
      const { userId } = params;
      const keygenRes = await walletUtils.keygen(ctx, userId);
      return keygenRes;
    }
    case 'SEND_TRANSACTION': {
      const { share, walletId, userId, tx, chain } = params;
      return walletUtils.sendTransaction(ctx, share, walletId, userId, tx, chain);
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

addEventListener('message', async (e: { data: Message }) => {
  const { ctx } = e.data;
  await loadWasm(ctx);

  const result = await executeMessage(e.data);
  self.postMessage(result);
  self.close();
});
