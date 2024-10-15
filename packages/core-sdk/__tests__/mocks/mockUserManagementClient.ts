import { vi } from 'vitest';
import { PARTNER, SESSION_ID, USER_ID } from '../constants';

export const mockExternalWalletLogin = vi.fn().mockResolvedValue({ userId: USER_ID });
export const mockCreateUser = vi.fn().mockResolvedValue({ userId: USER_ID });
export const mockCheckUserExists = vi.fn().mockResolvedValue({ data: { exists: true } });
export const mockVerifyEmail = vi.fn().mockResolvedValue({});
export const mockVerifyPhone = vi.fn().mockResolvedValue({});
export const mockGetPartner = vi.fn().mockResolvedValue({ data: { partner: PARTNER } });
export const mockAddSessionPublicKey = vi.fn().mockResolvedValue({ data: { id: SESSION_ID, partnerId: PARTNER.id } });
export const mockLogout = vi.fn().mockResolvedValue(true);

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
    })),
  };
});
