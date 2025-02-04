import ParaWeb from '@getpara/web-sdk';

export class ParaInternal extends ParaWeb {
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
