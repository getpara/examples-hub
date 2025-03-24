import { vi } from 'vitest';
import {
  FARCASTER_CONNECT_URI,
  PARTNER,
  RECOVERY_PUBLIC_KEYS,
  SESSION_ID,
  SESSION_LOOKUP_ID,
  SESSION_PUBLIC_KEYS,
  SHARES,
  SOLANA_WALLET,
  TEMP_TRANSMISSION_INIT_ID,
  TWOFA_URI,
  TWOFA_VERIFY_RESP,
  USER_EMAIL,
  USER_FARCASTER_USERNAME,
  USER_ID,
  WALLET,
  WALLETS,
} from '../constants';
import Client, { SessionInfo, WalletType } from '@getpara/user-management-client';

export const mockExternalWalletLogin = vi.fn().mockResolvedValue({ userId: USER_ID });
export const mockCreateUser = vi.fn().mockResolvedValue({ userId: USER_ID });
export const mockCheckUserExists = vi.fn().mockResolvedValue({ data: { exists: true } });
export const mockVerifyEmail = vi.fn().mockResolvedValue({});
export const mockVerifyPhone = vi.fn().mockResolvedValue({});
export const mockGetPartner = vi.fn().mockResolvedValue({ data: { partner: PARTNER } });
export const mockAddSessionPublicKey = vi.fn().mockResolvedValue({ data: { id: SESSION_ID, partnerId: PARTNER.id } });
export const mockLogout = vi.fn().mockResolvedValue(true);
export const mockTouchSession = vi.fn<never, SessionInfo>().mockResolvedValue({
  sessionId: SESSION_ID,
  partnerId: PARTNER.id,
  sessionLookupId: SESSION_LOOKUP_ID,
  userId: USER_ID,
  email: USER_EMAIL,
  isAuthenticated: true,
  supportedWalletTypes: PARTNER.supportedWalletTypes,
  cosmosPrefix: PARTNER.cosmosPrefix,
  currentWalletIds: { [WalletType.EVM]: [WALLET.id], [WalletType.SOLANA]: [SOLANA_WALLET.id] },
  needsWallet: false,
});
export const mockTempTransmissionInit = vi.fn().mockResolvedValue({ data: { id: TEMP_TRANSMISSION_INIT_ID } });
export const mockTempTransmission = vi.fn().mockResolvedValue({ data: { message: 'test' } });
export const mockInitializeFarcasterLogin = vi.fn().mockResolvedValue({
  data: { connect_uri: FARCASTER_CONNECT_URI },
});
export const mockGetFarcasterAuthStatus = vi.fn().mockResolvedValue({
  data: { userId: USER_ID, userExists: true, username: USER_FARCASTER_USERNAME, state: 'completed' },
});
export const mockGetPregenWallets = vi.fn().mockResolvedValue({ wallets: [] });
export const mockGetWallets = vi.fn().mockResolvedValue({ data: { wallets: WALLETS } });
export const mockGetSessionPublicKeys = vi.fn().mockResolvedValue({ data: { keys: SESSION_PUBLIC_KEYS } });
export const mockUploadUserKeyShares = vi.fn().mockResolvedValue({});
export const mockDistributeParaShare = vi.fn().mockResolvedValue({});
export const mockGetRecoveryPublicKeys = vi.fn().mockResolvedValue({ recoveryPublicKeys: RECOVERY_PUBLIC_KEYS });
export const mockPersistRecoveryPublicKeys = vi.fn().mockResolvedValue({ recoveryPublicKeys: RECOVERY_PUBLIC_KEYS });
export const mockClaimPregenWallets = vi
  .fn()
  .mockImplementation(({ walletIds }: { walletIds: string[]; userId: string }) => ({ walletIds }));
export const mockGetTransmissionKeyshares = vi.fn().mockResolvedValue({
  data: {
    temporaryShares: SHARES,
  },
});
export const mockUpdatePregenWallet = vi.fn().mockResolvedValue({});
export const mockSetup2FA = vi.fn().mockResolvedValue({ data: { uri: TWOFA_URI } });
export const mockCheck2FAStatus = vi.fn().mockResolvedValue({ data: { isSetup: true } });
export const mockEnable2FA = vi.fn().mockResolvedValue({});
export const mockVerify2FA = vi.fn().mockResolvedValue({ data: TWOFA_VERIFY_RESP });
export const mockVerify2FAForPhone = vi.fn().mockResolvedValue({ data: TWOFA_VERIFY_RESP });
export const mockGetPasswords = vi.fn().mockResolvedValue([]);
export const mockGetSupportedAuthMethods = vi.fn().mockResolvedValue({ supportedAuthMethods: ['BIOMETRIC', 'PASSWORD'] });
export const mockVerifyTelegram = vi
  .fn<Parameters<Client['verifyTelegram']>, ReturnType<Client['verifyTelegram']>>()
  .mockImplementation(async obj => {
    return Promise.resolve({
      isValid: true,
      userId: USER_ID,
      telegramUserId: obj.id.toString(),
      isNewUser: false,
      supportedAuthMethods: [],
    });
  });
export const mockKeepSessionAlive = vi.fn().mockResolvedValue({});
export const mockCreateOnRampPurchase = vi
  .fn()
  .mockImplementation(({ params }) => ({ id: 'id', userId: USER_ID, ...params }));

vi.mock('@getpara/user-management-client', async importOriginal => {
  const actual = await importOriginal<{ default: Client }>();
  return {
    ...actual,
    default: vi.fn().mockImplementation(() => ({
      ...actual.default,
      externalWalletLogin: mockExternalWalletLogin,
      createUser: mockCreateUser,
      checkUserExists: mockCheckUserExists,
      verifyEmail: mockVerifyEmail,
      verifyPhone: mockVerifyPhone,
      addSessionPublicKey: mockAddSessionPublicKey,
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
      check2FAStatus: mockCheck2FAStatus,
      enable2FA: mockEnable2FA,
      verify2FA: mockVerify2FA,
      verify2FAForPhone: mockVerify2FAForPhone,
      getPasswords: mockGetPasswords,
      persistRecoveryPublicKeys: mockPersistRecoveryPublicKeys,
      getSupportedAuthMethods: mockGetSupportedAuthMethods,
      verifyTelegram: mockVerifyTelegram,
      keepSessionAlive: mockKeepSessionAlive,
      createOnRampPurchase: mockCreateOnRampPurchase,
    })),
  };
});
