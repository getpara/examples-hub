import {
  PortalMessageType,
  PortalRequest,
  PortalRequestPayload,
  PortalResponse,
  PortalResponsePayload,
} from '@getpara/web-sdk';
import { v4 as uuid } from 'uuid';

export class PortalEmitter {
  private counterpart: Window | null;
  private origin: string;

  constructor(origin?: string) {
    this.counterpart = window.opener || window.parent;
    this.origin = origin ?? '*';
  }

  protected sendMessage<T extends PortalMessageType>(
    request: Omit<PortalRequest, 'id' | 'isPara'>,
  ): Promise<PortalResponsePayload<T>> {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      const messageId = uuid();

      // Listen for the response on port1 of the MessageChannel
      messageChannel.port1.onmessage = (event: MessageEvent<PortalResponse>) => {
        if (event.data.id === messageId) {
          messageChannel.port1.close(); // Close the port after receiving the response
          if (event.data.status === 'ERROR') {
            reject('error' in event.data.payload ? event.data.payload.error : 'An error occurred');
          } else {
            resolve(event.data.payload as PortalResponsePayload<T>);
          }
        }
      };

      this.counterpart.postMessage(
        {
          id: messageId,
          isPara: true,
          ...request,
        },
        this.origin,
        [messageChannel.port2],
      );

      // Optional: Add a timeout to handle cases where no response is received
      setTimeout(() => {
        messageChannel.port1.close();
        reject(new Error('Timeout: No response received.'));
      }, 30000);
    });
  }

  async init() {
    return await this.sendMessage<'ONRAMPS__INIT'>({ type: 'ONRAMPS__INIT' });
  }

  async updateOnRampPurchase(payload: PortalRequestPayload<'ONRAMPS__UPDATE_PURCHASE'>) {
    return await this.sendMessage<'ONRAMPS__UPDATE_PURCHASE'>({ type: 'ONRAMPS__UPDATE_PURCHASE', payload });
  }

  async signMoonPayUrl(payload: PortalRequestPayload<'ONRAMPS__SIGN_MOONPAY_URL'>) {
    return await this.sendMessage<'ONRAMPS__SIGN_MOONPAY_URL'>({ type: 'ONRAMPS__SIGN_MOONPAY_URL', payload });
  }

  async signWithdrawTx(payload: PortalRequestPayload<'ONRAMPS__SIGN_DEPOSIT_TX'>) {
    return await this.sendMessage<'ONRAMPS__SIGN_DEPOSIT_TX'>({ type: 'ONRAMPS__SIGN_DEPOSIT_TX', payload });
  }

  async walletSwitchCompleted(payload: PortalRequestPayload<'WALLET_SWITCH_COMPLETED'>) {
    return await this.sendMessage({ type: 'WALLET_SWITCH_COMPLETED', payload });
  }

  async syncWallets() {
    return await this.sendMessage<'SYNC_WALLETS'>({ type: 'SYNC_WALLETS' });
  }
}
