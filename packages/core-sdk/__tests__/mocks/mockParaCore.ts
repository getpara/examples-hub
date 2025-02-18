import ParaCore from '../../src/index.js';
import { MockPlatformUtils } from './mockPlatformUtils.js';

export class MockPara extends ParaCore {
  protected getPlatformUtils() {
    return new MockPlatformUtils();
  }

  retrieveSessionCookie = () => 'session-cookie';

  persistSessionCookie = (_: string) => {};

  getSupportedCreateAuthMethods = super.getSupportedCreateAuthMethods;
  isUsingExternalWallet = super.isUsingExternalWallet;
  getTransmissionKeyShares = super.getTransmissionKeyShares;
  userSetupAfterLogin = super.userSetupAfterLogin;
  setLoginEncryptionKeyPair = super.setLoginEncryptionKeyPair;
  getPortalURL = super.getPortalURL;
  isProviderModalDisabled = super.isProviderModalDisabled;
  supportedAuthMethods = super.supportedAuthMethods;
  getUserBiometricLocationHints = super.getUserBiometricLocationHints;
  exitLoops = super.exitLoops;
  exitLogin = super.exitLogin;
  exitAccountCreation = super.exitAccountCreation;
  exitOAuth = super.exitOAuth;
  exitFarcaster = super.exitFarcaster;
}
