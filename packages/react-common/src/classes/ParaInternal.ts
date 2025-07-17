import ParaWeb, { InternalInterface } from '@getpara/web-sdk';

export class ParaInternal extends ParaWeb implements InternalInterface {
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
  prepareLogin = super.prepareLogin;

  linkAccount = super.linkAccount;
  unlinkAccount = super.unlinkAccount;
  verifyEmailOrPhoneLink = super.verifyEmailOrPhoneLink;
  verifyOAuthLink = super.verifyOAuthLink;
  verifyTelegramLink = super.verifyTelegramLink;
  verifyFarcasterLink = super.verifyFarcasterLink;
  verifyExternalWalletLink = super.verifyExternalWalletLink;
}
