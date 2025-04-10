import ParaWeb from '@getpara/web-sdk';

export class ParaInternal extends ParaWeb {
  setupAfterLogin = super.setupAfterLogin;
  getSupportedCreateAuthMethods = super.getSupportedCreateAuthMethods;
  getTransmissionKeyShares = super.getTransmissionKeyShares;
  userSetupAfterLogin = super.userSetupAfterLogin;
  setLoginEncryptionKeyPair = super.setLoginEncryptionKeyPair;
  getPortalURL = super.getPortalURL;
  isProviderModalDisabled = super.isProviderModalDisabled;
  setAuth = super.setAuth;
  constructPortalUrlV2 = super.constructPortalUrlV2;
  supportedAuthMethods = super.supportedAuthMethods;
  getUserBiometricLocationHints = super.getUserBiometricLocationHints;
  exitLoops = super.exitLoops;
  exitLogin = super.exitLogin;
  exitAccountCreation = super.exitAccountCreation;
  exitOAuth = super.exitOAuth;
  exitFarcaster = super.exitFarcaster;
}
