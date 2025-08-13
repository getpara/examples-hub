import ParaCore, { ConstructorOpts, Environment, getNetworkPrefix } from '@getpara/core-sdk';
import { WebUtils } from './WebUtils.js';
import { isPasskeySupported } from './utils/isPasskeySupported.js';
import { PortalRequest } from './types/onRamp.js';
import { offRampSend } from './utils/offrampSend.js';

export class Para extends ParaCore {
  farcasterSdk = undefined;
  isReady = false;
  isFarcasterMiniApp = false;

  // Redeclare all constructor overloads from ParaCore
  constructor(env: Environment | undefined, apiKey: string, opts?: ConstructorOpts);
  constructor(apiKey: string, opts?: ConstructorOpts);
  constructor(
    envOrApiKey: Environment | undefined | string,
    apiKeyOrOpts?: string | ConstructorOpts,
    opts?: ConstructorOpts,
  ) {
    super(envOrApiKey as any, apiKeyOrOpts as any, opts);

    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.portalEventListener);
    }
  }

  async ready() {
    if (!this.isReady) {
      try {
        // @ts-ignore
        this.farcasterSdk = (await import('@farcaster/miniapp-sdk'))?.sdk ?? undefined;

        if (!this.farcasterSdk?.isInMiniApp) {
          throw new Error('Farcaster SDK not detected or failed to load');
        }

        this.devLog('Farcaster SDK detected and loaded successfully.', this.farcasterSdk);
      } catch (e) {
        this.devLog(e);
      }

      if (!!this.farcasterSdk?.isInMiniApp) {
        this.devLog('Initializing Farcaster SDK...');
        this.isFarcasterMiniApp = await this.farcasterSdk.isInMiniApp();

        if (this.isFarcasterMiniApp) {
          this.externalWalletConnectionOnly = true;
        }
      }

      this.isReady = true;
    }
  }

  protected portalEventListener = async (event: MessageEvent<PortalRequest>) => {
    if (!event.data.isPara || event.origin !== (await this.getPortalURL()) || this.isPortal()) {
      return;
    }

    const messagePort = event.ports[0];

    const userId = this.assertUserId();

    let payload,
      status = 'SUCCESS';
    try {
      switch (event.data.type) {
        case 'ONRAMPS__INIT':
          {
            const onRampConfig = await this.ctx.client.getOnRampConfig();
            payload = { onRampPurchase: this.onRampPopup?.onRampPurchase, onRampConfig };
          }
          break;
        case 'ONRAMPS__SIGN_MOONPAY_URL':
          {
            const { url } = event.data.payload;
            const onRampPurchase = this.onRampPopup?.onRampPurchase;
            const res = await this.ctx.client.signMoonPayUrl(userId, {
              url,
              type: onRampPurchase.walletType,
              cosmosPrefix: getNetworkPrefix(onRampPurchase.network),
              testMode: onRampPurchase.testMode,
              walletId: onRampPurchase.walletId,
              externalWalletAddress: onRampPurchase.externalWalletAddress,
            });

            payload = { signature: res.data.signature };
          }
          break;
        case 'ONRAMPS__SIGN_DEPOSIT_TX': {
          const { depositRequest } = event.data.payload;
          const onRampPurchase = this.onRampPopup?.onRampPurchase;

          try {
            const { txHash, updatedOnRampPurchase } = await offRampSend(this, onRampPurchase, depositRequest);

            payload = { onRampPurchase: updatedOnRampPurchase, txHash };
          } catch (e) {
            throw e;
          }
        }
      }
    } catch (e) {
      status = 'ERROR';
      payload = { error: e.message };
    }

    messagePort?.postMessage({
      id: event.data.id,
      type: event.data.type,
      isPara: true,
      status,
      payload,
    });
    messagePort?.close();
  };

  protected get toStringAdditions() {
    return {
      isFarcasterMiniApp: this.isFarcasterMiniApp,
    };
  }

  protected getPlatformUtils() {
    return new WebUtils();
  }

  #isPasskeySupported: boolean | undefined = undefined;

  async isPasskeySupported() {
    if (this.#isPasskeySupported === undefined) {
      this.#isPasskeySupported = await isPasskeySupported();
    }

    return this.#isPasskeySupported;
  }
}
