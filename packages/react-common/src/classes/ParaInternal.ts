import ParaWeb from '@getpara/web-sdk';

export class ParaInternal extends ParaWeb {
  setupAfterLogin = super.setupAfterLogin;
  getTransmissionKeyShares = super.getTransmissionKeyShares;
  userSetupAfterLogin = super.userSetupAfterLogin;
  setLoginEncryptionKeyPair = super.setLoginEncryptionKeyPair;
  getPortalURL = super.getPortalURL;
  isProviderModalDisabled = super.isProviderModalDisabled;
  setAuth = super.setAuth;
  supportedAuthMethods = super.supportedAuthMethods;
  constructPortalUrl = super.constructPortalUrl;
  getNewCredentialAndUrl = super.getNewCredentialAndUrl;
}
