import { vi } from 'vitest';
import { PREGEN_WALLET, SIGNATURE, WALLET } from '../constants';

type MessageHandler = (event: { data: any }) => void;

export class Worker {
  url: string;
  onmessage: MessageHandler;
  constructor(stringUrl: string) {
    this.url = stringUrl;
    this.onmessage = () => {};
  }
  postMessage(msg: any): any {
    const { functionType } = msg;

    switch (functionType) {
      case 'KEYGEN': {
        this.onmessage({
          data: {
            walletId: WALLET.id,
            signer: WALLET.signer,
          },
        });
        return;
      }
      case 'PREKEYGEN': {
        this.onmessage({
          data: {
            walletId: PREGEN_WALLET.id,
            signer: PREGEN_WALLET.signer,
          },
        });
        return;
      }
      case 'REFRESH': {
        if (msg.returnObject) {
          this.onmessage({
            data: {
              protocolId: WALLET.protocolId,
              signer: WALLET.signer,
            },
          });
          return;
        }
        this.onmessage({
          data: WALLET.signer,
        });
        return;
      }
      case 'ED25519_KEYGEN': {
        this.onmessage({
          data: {
            walletId: WALLET.id,
            signer: WALLET.signer,
          },
        });
        return;
      }
      case 'ED25519_PREKEYGEN': {
        this.onmessage({
          data: {
            walletId: PREGEN_WALLET.id,
            signer: PREGEN_WALLET.signer,
          },
        });
        return;
      }
      case 'GET_PRIVATE_KEY': {
        this.onmessage({
          data: WALLET.privateKey,
        });
        return;
      }
      case 'SIGN_TRANSACTION': {
        this.onmessage({
          data: {
            signature: SIGNATURE,
          },
        });
        return;
      }
      case 'SEND_TRANSACTION': {
        this.onmessage({
          data: {
            signature: SIGNATURE,
          },
        });
        return;
      }
      case 'SIGN_MESSAGE': {
        this.onmessage({
          data: {
            signature: SIGNATURE,
          },
        });
        return;
      }
      case 'ED25519_SIGN': {
        this.onmessage({
          data: {
            signature: SIGNATURE,
          },
        });
        return;
      }
    }
  }
  terminate() {}
}

export const workerTerminateSpy = vi.spyOn(Worker.prototype, 'terminate');
export const workerMessagePostSpy = vi.spyOn(Worker.prototype, 'postMessage');

Object.defineProperty(globalThis, 'Worker', {
  writable: true,
  value: Worker,
});
