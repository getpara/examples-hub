import * as Sentry from '@sentry/browser';
import ParaCore, { ConstructorOpts, Environment } from '@getpara/core-sdk';
import { WebUtils } from './WebUtils.js';
import { isPasskeySupported } from './utils/isPasskeySupported.js';

export class Para extends ParaCore {
  farcasterSdk = undefined;
  isReady = false;
  isFarcasterMiniApp = false;

  constructor(env: Environment, apiKey?: string, opts?: ConstructorOpts) {
    super(env, apiKey, opts);

    // starting with non-prod to see what kind of errors we get and if sensitive data is tracked
    // will turn on in prod after monitoring
    /* v8 ignore next 6 */
    if (env !== Environment.PROD && env !== Environment.DEV) {
      Sentry.init({
        environment: env.toLowerCase(),
        dsn: 'https://38f27d4836da617ab9e95cf66b9611d9@o4504568036720640.ingest.us.sentry.io/4508850812944384',
      });
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
