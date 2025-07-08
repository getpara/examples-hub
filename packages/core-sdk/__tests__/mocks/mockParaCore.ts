import ParaCore from '../../src/index.js';
import { MockPlatformUtils } from './mockPlatformUtils.js';

export class MockPara extends ParaCore {
  protected getPlatformUtils() {
    return new MockPlatformUtils();
  }

  isPasskeySupported = () => Promise.resolve(true);

  retrieveSessionCookie = () => 'session-cookie';

  persistSessionCookie = (_: string) => {};

  setAuth = super.setAuth;
  getTransmissionKeyShares = super.getTransmissionKeyShares;
  userSetupAfterLogin = super.userSetupAfterLogin;
  setLoginEncryptionKeyPair = super.setLoginEncryptionKeyPair;
  getPortalURL = super.getPortalURL;
  isProviderModalDisabled = super.isProviderModalDisabled;
  supportedAuthMethods = super.supportedAuthMethods;
  getUserBiometricLocationHints = super.getUserBiometricLocationHints;

  linkAccount = super.linkAccount;
  unlinkAccount = super.unlinkAccount;
  verifyEmailOrPhoneLink = super.verifyEmailOrPhoneLink;
  verifyTelegramLink = super.verifyTelegramLink;
  verifyFarcasterLink = super.verifyFarcasterLink;
  verifyExternalWalletLink = super.verifyExternalWalletLink;
  verifyOAuthLink = super.verifyOAuthLink;

  ready = (): Promise<void> => {
    this.isReady = true;
    return Promise.resolve();
  };
}

export class MockParaAsync extends MockPara {
  protected getPlatformUtils() {
    return new MockPlatformUtils(true);
  }
}
