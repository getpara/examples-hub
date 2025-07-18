import ParaCore, {
  PlatformUtils,
  ConstructorOpts,
  Environment,
  CoreMethodParams,
  CoreMethodResponse,
} from '@getpara/core-sdk';
import { ServerUtils } from './ServerUtils.js';

export class Para extends ParaCore {
  constructor(env: Environment, apiKey?: string, opts?: ConstructorOpts) {
    super(env, apiKey, opts);
  }

  async ready() {
    this.isReady = true;
  }

  protected getPlatformUtils(): PlatformUtils {
    return new ServerUtils();
  }

  async isPasskeySupported(): Promise<boolean> {
    return false;
  }

  /**
   * Claims a pregenerated wallet.
   *
   * NOTE: This function is only available on the client side.
   * When called from the server SDK, it throws an error.
   *
   * @param {Object} opts the options object.
   * @param {string} opts.pregenIdentifier - the identifier of the user claiming the wallet.
   * @param {TPregenIdentifierType} opts.pregenIdentifierType - the type of the identifier.
   * @returns {Promise<string | undefined>} A promise that rejects with an error.
   */
  async claimPregenWallets(_: CoreMethodParams<'claimPregenWallets'>): CoreMethodResponse<'claimPregenWallets'> {
    throw new Error(
      'claimPregenWallets is not available in the server SDK. ' +
        'This function is only supported on the client side. ' +
        'Please ensure you are using the client SDK to call this method.',
    );
  }
}
