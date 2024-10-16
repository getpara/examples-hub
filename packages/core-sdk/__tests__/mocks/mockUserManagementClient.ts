import { vi } from 'vitest';
import {
  FARCASTER_CONNECT_URI,
  PARTNER,
  SESSION_ID,
  SESSION_LOOKUP_ID,
  TEMP_TRANSMISSION_INIT_ID,
  USER_EMAIL,
  USER_FARCASTER_USERNAME,
  USER_ID,
} from '../constants';

export const mockExternalWalletLogin = vi.fn().mockResolvedValue({ userId: USER_ID });
export const mockCreateUser = vi.fn().mockResolvedValue({ userId: USER_ID });
export const mockCheckUserExists = vi.fn().mockResolvedValue({ data: { exists: true } });
export const mockVerifyEmail = vi.fn().mockResolvedValue({});
export const mockVerifyPhone = vi.fn().mockResolvedValue({});
export const mockGetPartner = vi.fn().mockResolvedValue({ data: { partner: PARTNER } });
export const mockAddSessionPublicKey = vi.fn().mockResolvedValue({ data: { id: SESSION_ID, partnerId: PARTNER.id } });
export const mockLogout = vi.fn().mockResolvedValue(true);
export const mockTouchSession = vi.fn().mockResolvedValue({
  data: {
    sessionId: SESSION_ID,
    partnerId: PARTNER.id,
    sessionLookupId: SESSION_LOOKUP_ID,
    userId: USER_ID,
    email: USER_EMAIL,
  },
});
export const mockTempTrasmissionInit = vi.fn().mockResolvedValue({ data: { id: TEMP_TRANSMISSION_INIT_ID } });
export const mockInitializeFarcasterLogin = vi.fn().mockResolvedValue({
  data: { connect_uri: FARCASTER_CONNECT_URI },
});
export const mockGetFarcasterAuthStatus = vi.fn().mockResolvedValue({
  data: { userId: USER_ID, userExists: true, username: USER_FARCASTER_USERNAME, state: 'completed' },
});

vi.mock('@usecapsule/user-management-client', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    default: vi.fn().mockImplementation(() => ({
      ...(actual as any).default,
      externalWalletLogin: mockExternalWalletLogin,
      createUser: mockCreateUser,
      checkUserExists: mockCheckUserExists,
      verifyEmail: mockVerifyEmail,
      verifyPhone: mockVerifyPhone,
      addSessionPublicKey: mockAddSessionPublicKey,
      getPartner: mockGetPartner,
      logout: mockLogout,
      touchSession: mockTouchSession,
      tempTrasmissionInit: mockTempTrasmissionInit,
      initializeFarcasterLogin: mockInitializeFarcasterLogin,
      getFarcasterAuthStatus: mockGetFarcasterAuthStatus,
    })),
  };
});
