import { vi } from 'vitest';
import { PREGEN_WALLET, SIGNATURE, WALLET } from '../constants';

type MessageHandler = (event: any) => void;

export class Worker {
  url: string;
  on: any;
  onmessage: MessageHandler;
  constructor(stringUrl: string) {
    this.url = stringUrl;
    this.on = (event: string, handler: MessageHandler) => {
      if (event === 'message') {
        this.onmessage = handler;
      }
    };
  }
  postMessage(msg: any): any {
    const { functionType, workId } = msg;

    switch (functionType) {
      case 'KEYGEN': {
        this.onmessage({
          workId,
          walletId: WALLET.id,
          signer: WALLET.signer,
        });
        return;
      }
      case 'PREKEYGEN': {
        this.onmessage({
          workId,
          walletId: PREGEN_WALLET.id,
          signer: PREGEN_WALLET.signer,
        });
        return;
      }
      case 'REFRESH': {
        this.onmessage({
          workId,
          protocolId: WALLET.protocolId,
          signer: WALLET.signer,
        });
        return;
      }
      case 'ED25519_KEYGEN': {
        this.onmessage({
          workId,
          walletId: WALLET.id,
          signer: WALLET.signer,
        });
        return;
      }
      case 'ED25519_PREKEYGEN': {
        this.onmessage({
          workId,
          walletId: PREGEN_WALLET.id,
          signer: PREGEN_WALLET.signer,
        });
        return;
      }
      case 'SIGN_TRANSACTION': {
        this.onmessage({
          workId,
          signature: SIGNATURE,
        });
        return;
      }
      case 'SEND_TRANSACTION': {
        this.onmessage({
          workId,
          signature: SIGNATURE,
        });
        return;
      }
      case 'SIGN_MESSAGE': {
        this.onmessage({
          workId,
          signature: SIGNATURE,
        });
        return;
      }
      case 'ED25519_SIGN': {
        this.onmessage({
          workId,
          signature: SIGNATURE,
        });
        return;
      }
      case 'GET_PRIVATE_KEY': {
        this.onmessage({
          workId,
          privateKey: WALLET.privateKey,
        });
        return;
      }
    }
  }
  terminate() {}
}

vi.mock('worker_threads', () => {
  return { Worker };
});

export const workerTerminateSpy = vi.spyOn(Worker.prototype, 'terminate');
export const workerMessagePostSpy = vi.spyOn(Worker.prototype, 'postMessage');

Object.defineProperty(globalThis, 'Worker', {
  writable: true,
  value: Worker,
});
