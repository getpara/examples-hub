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
  getSupportedCreateAuthMethods = super.getSupportedCreateAuthMethods;
  getTransmissionKeyShares = super.getTransmissionKeyShares;
  userSetupAfterLogin = super.userSetupAfterLogin;
  setLoginEncryptionKeyPair = super.setLoginEncryptionKeyPair;
  getPortalURL = super.getPortalURL;
  isProviderModalDisabled = super.isProviderModalDisabled;
  supportedAuthMethods = super.supportedAuthMethods;
  getUserBiometricLocationHints = super.getUserBiometricLocationHints;
}

export class MockParaAsync extends MockPara {
  protected getPlatformUtils() {
    return new MockPlatformUtils(true);
  }
}
