import { vi } from 'vitest';
import {
  EXTERNAL_WALLET,
  FARCASTER_CONNECT_URI,
  LINKED_ACCOUNTS,
  PARTNER,
  RECOVERY_PUBLIC_KEYS,
  SESSION_ID,
  SESSION_LOOKUP_ID,
  SESSION_PUBLIC_KEYS,
  SIGNATURE_VERIFICATION_MESSAGE,
  SOLANA_WALLET,
  TEMP_TRANSMISSION_INIT_ID,
  TWOFA_URI,
  TWOFA_VERIFY_RESP,
  USER_BIOMETRIC_HINTS,
  USER_EMAIL,
  USER_FARCASTER_SIGNUP_STAGE,
  USER_FARCASTER_USERNAME,
  USER_ID,
  USER_TELEGRAM_AUTH_OBJECT,
  UUID,
  WALLET,
} from '../constants';
import Client, {
  ServerAuthStateLogin,
  ServerAuthStateSignup,
  ServerAuthStateVerify,
  isTelegram,
  isFarcaster,
  PrimaryAuth,
  AuthMethod,
  isExternalWallet,
  AuthExtras,
  LinkAccountParams,
} from '@getpara/user-management-client';

export const authExtras = (auth?: PrimaryAuth | undefined): AuthExtras => {
  if (isTelegram(auth)) {
    return {
      displayName: `${USER_TELEGRAM_AUTH_OBJECT.first_name} ${USER_TELEGRAM_AUTH_OBJECT.last_name}`,
      username: USER_FARCASTER_USERNAME,
      pfpUrl: USER_TELEGRAM_AUTH_OBJECT.photo_url,
    };
  }

  if (isFarcaster(auth)) {
    return {
      pfpUrl: USER_TELEGRAM_AUTH_OBJECT.photo_url,
      displayName: `@${USER_FARCASTER_USERNAME}`,
      username: USER_FARCASTER_USERNAME,
    };
  }

  if (isExternalWallet(auth)) {
    return {
      externalWallet: EXTERNAL_WALLET,
    };
  }

  return {};
};

export const getVerifyState = (auth: PrimaryAuth): ServerAuthStateVerify => ({
  auth,
  stage: 'verify',
  userId: USER_ID,
  ...(isExternalWallet(auth) ? { signatureVerificationMessage: SIGNATURE_VERIFICATION_MESSAGE } : {}),
});

export const getSignupState = (auth: PrimaryAuth): ServerAuthStateSignup => ({
  auth,
  stage: 'signup',
  userId: USER_ID,
  signupAuthMethods: [AuthMethod.PASSKEY, AuthMethod.PASSWORD],
  ...authExtras(auth),
});

export const getSignupStateWithPIN = (auth: PrimaryAuth): ServerAuthStateSignup => ({
  ...getSignupState(auth),
  signupAuthMethods: [AuthMethod.PASSKEY, AuthMethod.PIN],
});

export const getLoginState = (auth: PrimaryAuth): ServerAuthStateLogin => ({
  auth,
  stage: 'login',
  userId: USER_ID,
  biometricHints: USER_BIOMETRIC_HINTS,
  loginAuthMethods: [AuthMethod.PASSKEY, AuthMethod.PASSWORD],
  hasPasswordWithoutPIN: true,
  ...authExtras(auth),
});

export const getLoginStateWithPIN = (auth: PrimaryAuth): ServerAuthStateLogin => ({
  ...getLoginState(auth),
  loginAuthMethods: [AuthMethod.PASSKEY, AuthMethod.PIN],
});

export const mockLoginExternalWallet = vi.fn();
export const mockVerifyExternalWallet = vi.fn();
export const mockSignUpOrLogIn = vi.fn();
export const mockCreateUser = vi.fn();
export const mockCheckUserExists = vi.fn();
export const mockVerifyAccount = vi.fn();
export const mockVerifyEmail = vi.fn();
export const mockVerifyPhone = vi.fn();
export const mockVerifyOAuth = vi.fn();
export const mockGetPartner = vi.fn();
export const mockSetCurrentWalletIds = vi.fn();
export const mockAddSessionPublicKey = vi.fn();
export const mockAddSessionPasswordPublicKey = vi.fn();
export const mockLogout = vi.fn();
export const mockTouchSession = vi.fn();
export const mockTempTransmissionInit = vi.fn();
export const mockTempTransmission = vi.fn();
export const mockInitializeFarcasterLogin = vi.fn();
export const mockGetFarcasterAuthStatus = vi.fn();
export const mockGetPregenWallets = vi.fn();
export const mockGetWallets = vi.fn();
export const mockGetSessionPublicKeys = vi.fn();
export const mockUploadUserKeyShares = vi.fn();
export const mockDistributeParaShare = vi.fn();
export const mockGetRecoveryPublicKeys = vi.fn();
export const mockPersistRecoveryPublicKeys = vi.fn();
export const mockClaimPregenWallets = vi.fn();
export const mockGetTransmissionKeyshares = vi.fn();
export const mockUpdatePregenWallet = vi.fn();
export const mockSetup2FA = vi.fn();
export const mockCheck2FAStatus = vi.fn();
export const mockEnable2FA = vi.fn();
export const mockVerify2FA = vi.fn();
export const mockVerify2FAForPhone = vi.fn();
export const mockGetPasswords = vi.fn();
export const mockGetSupportedAuthMethods = vi.fn();
export const mockGetBiometricLocationHints = vi.fn();
export const mockVerifyTelegramV2 = vi.fn();
export const mockKeepSessionAlive = vi.fn();
export const mockCreateOnRampPurchase = vi.fn();
export const mockGetPendingTransaction = vi.fn();
export const mockGetWalletBalance = vi.fn().mockResolvedValue({ balance: '1000' });
export const mockResendVerificationCode = vi.fn();
export const mockResendVerificationCodeByPhone = vi.fn();
export const mockGetAccountMetadata = vi.fn();
export const mockTrackError = vi.fn();
export const mockGetLinkedAccounts = vi.fn().mockResolvedValue({
  accounts: LINKED_ACCOUNTS,
});
export const mockLinkAccount = vi.fn();
export const mockUnlinkAccount = vi.fn();
export const mockVerifyLink = vi.fn();
export const mockIssueJwt = vi.fn();
export const mockGetSupportedAuthMethodsV2 = vi.fn();
export const mockSendLoginVerificationCode = vi.fn();

mockLinkAccount.mockImplementation(async (args: LinkAccountParams) => {
  switch (true) {
    case 'externalWallet' in args: {
      return {
        linkedAccountId: UUID,
        signatureVerificationMessage: UUID,
      };
    }
    default: {
      return { linkedAccountId: UUID };
    }
  }
});

export function resetClientMocks() {
  mockLoginExternalWallet.mockResolvedValue(getVerifyState({ externalWalletAddress: EXTERNAL_WALLET.address }));
  mockSignUpOrLogIn.mockResolvedValue(getVerifyState({ email: USER_EMAIL }));
  mockCreateUser.mockResolvedValue({ userId: USER_ID });
  mockCheckUserExists.mockResolvedValue({ exists: true });
  mockVerifyAccount.mockResolvedValue(getSignupState({ email: USER_EMAIL }));
  mockVerifyEmail.mockResolvedValue({});
  mockVerifyPhone.mockResolvedValue({});
  mockVerifyOAuth.mockResolvedValue(getSignupState({ email: USER_EMAIL }));
  mockGetPartner.mockResolvedValue({ data: { partner: PARTNER } });
  mockAddSessionPublicKey.mockResolvedValue({ data: { id: SESSION_LOOKUP_ID, partnerId: PARTNER.id } });
  mockAddSessionPasswordPublicKey.mockResolvedValue({ data: { id: SESSION_LOOKUP_ID, partnerId: PARTNER.id } });
  mockLogout.mockResolvedValue(true);
  mockTouchSession.mockResolvedValue({
    sessionId: SESSION_ID,
    partnerId: PARTNER.id,
    sessionLookupId: SESSION_LOOKUP_ID,
    userId: USER_ID,
    email: USER_EMAIL,
    isAuthenticated: true,
    supportedWalletTypes: PARTNER.supportedWalletTypes!,
    cosmosPrefix: PARTNER.cosmosPrefix,
    currentWalletIds: { EVM: [WALLET.id], SOLANA: [SOLANA_WALLET.id] },
    needsWallet: false,
  });
  mockTempTransmissionInit.mockResolvedValue({ data: { id: TEMP_TRANSMISSION_INIT_ID } });
  mockTempTransmission.mockResolvedValue({ data: { message: 'test' } });
  mockInitializeFarcasterLogin.mockResolvedValue({
    connect_uri: FARCASTER_CONNECT_URI,
  });
  mockGetFarcasterAuthStatus.mockResolvedValue(USER_FARCASTER_SIGNUP_STAGE);
  mockGetPregenWallets.mockResolvedValue({ wallets: [] });
  mockGetWallets.mockResolvedValue({ data: { wallets: [] } });
  mockGetSessionPublicKeys.mockResolvedValue({ data: { keys: SESSION_PUBLIC_KEYS } });
  mockUploadUserKeyShares.mockResolvedValue({});
  mockDistributeParaShare.mockResolvedValue({});
  mockGetRecoveryPublicKeys.mockResolvedValue({ recoveryPublicKeys: RECOVERY_PUBLIC_KEYS });
  mockPersistRecoveryPublicKeys.mockResolvedValue({ recoveryPublicKeys: RECOVERY_PUBLIC_KEYS });
  mockClaimPregenWallets.mockImplementation(({ walletIds }: { walletIds: string[]; userId: string }) => ({ walletIds }));
  mockGetTransmissionKeyshares.mockResolvedValue({ data: { temporaryShares: [] } });
  mockUpdatePregenWallet.mockResolvedValue({});
  mockSetup2FA.mockResolvedValue({ uri: TWOFA_URI });
  mockCheck2FAStatus.mockResolvedValue({ data: { isSetup: true } });
  mockEnable2FA.mockResolvedValue({});
  mockVerify2FA.mockResolvedValue({ data: TWOFA_VERIFY_RESP });
  mockVerify2FAForPhone.mockResolvedValue({ data: TWOFA_VERIFY_RESP });
  mockGetPasswords.mockResolvedValue([]);
  mockGetSupportedAuthMethods.mockResolvedValue({ supportedAuthMethods: ['BIOMETRIC', 'PASSWORD'] });
  mockGetBiometricLocationHints.mockResolvedValue([]);
  mockVerifyTelegramV2.mockImplementation(async obj => {
    return Promise.resolve(getSignupState({ telegramUserId: obj.id.toString() }));
  });
  mockKeepSessionAlive.mockResolvedValue({});
  mockCreateOnRampPurchase.mockImplementation(({ params }) => ({ id: 'id', userId: USER_ID, ...params }));
  mockTrackError.mockResolvedValue({});
  mockGetSupportedAuthMethodsV2.mockResolvedValue({
    supportedAuthMethods: ['PASSKEY', 'PASSWORD'],
    hasPasswordWithoutPIN: true,
  });
  mockSendLoginVerificationCode.mockResolvedValue({
    userId: USER_ID,
  });
}

resetClientMocks();

vi.mock('@getpara/user-management-client', async importOriginal => {
  const actual = await importOriginal<{ default: Client }>();
  return {
    ...actual,
    default: vi.fn().mockImplementation(() => ({
      ...actual.default,
      loginExternalWallet: mockLoginExternalWallet,
      verifyExternalWallet: mockVerifyExternalWallet,
      signUpOrLogIn: mockSignUpOrLogIn,
      setCurrentWalletIds: mockSetCurrentWalletIds,
      createUser: mockCreateUser,
      checkUserExists: mockCheckUserExists,
      verifyAccount: mockVerifyAccount,
      verifyEmail: mockVerifyEmail,
      verifyPhone: mockVerifyPhone,
      verifyOAuth: mockVerifyOAuth,
      addSessionPublicKey: mockAddSessionPublicKey,
      addSessionPasswordPublicKey: mockAddSessionPasswordPublicKey,
      getPartner: mockGetPartner,
      logout: mockLogout,
      touchSession: mockTouchSession,
      tempTrasmissionInit: mockTempTransmissionInit,
      tempTrasmission: mockTempTransmission,
      initializeFarcasterLogin: mockInitializeFarcasterLogin,
      getFarcasterAuthStatus: mockGetFarcasterAuthStatus,
      getPregenWallets: mockGetPregenWallets,
      getWallets: mockGetWallets,
      getSessionPublicKeys: mockGetSessionPublicKeys,
      uploadUserKeyShares: mockUploadUserKeyShares,
      distributeParaShare: mockDistributeParaShare,
      getRecoveryPublicKeys: mockGetRecoveryPublicKeys,
      claimPregenWallets: mockClaimPregenWallets,
      getTransmissionKeyshares: mockGetTransmissionKeyshares,
      updatePregenWallet: mockUpdatePregenWallet,
      setup2FA: mockSetup2FA,
      setup2FAV2: mockSetup2FA,
      check2FAStatus: mockCheck2FAStatus,
      enable2FA: mockEnable2FA,
      verify2FA: mockVerify2FA,
      verify2FAV2: mockVerify2FA,
      verify2FAForPhone: mockVerify2FAForPhone,
      getPasswords: mockGetPasswords,
      persistRecoveryPublicKeys: mockPersistRecoveryPublicKeys,
      getSupportedAuthMethods: mockGetSupportedAuthMethods,
      verifyTelegram: mockVerifyTelegramV2,
      keepSessionAlive: mockKeepSessionAlive,
      createOnRampPurchase: mockCreateOnRampPurchase,
      getBiometricLocationHints: mockGetBiometricLocationHints,
      getPendingTransaction: mockGetPendingTransaction,
      getWalletBalance: mockGetWalletBalance,
      resendVerificationCode: mockResendVerificationCode,
      resendVerificationCodeByPhone: mockResendVerificationCodeByPhone,
      getAccountMetadata: mockGetAccountMetadata,
      trackError: mockTrackError,
      getLinkedAccounts: mockGetLinkedAccounts,
      linkAccount: mockLinkAccount,
      unlinkAccount: mockUnlinkAccount,
      verifyLink: mockVerifyLink,
      issueJwt: mockIssueJwt,
      getSupportedAuthMethodsV2: mockGetSupportedAuthMethodsV2,
      sendLoginVerificationCode: mockSendLoginVerificationCode,
    })),
  };
});
