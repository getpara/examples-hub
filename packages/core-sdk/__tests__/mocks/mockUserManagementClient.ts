import { vi } from 'vitest';
import { USER_ID } from '../constants';

export const mockExternalWalletLogin = vi.fn().mockResolvedValue({ userId: USER_ID });
export const mockLogout = vi.fn().mockResolvedValue(true);

vi.mock('@usecapsule/user-management-client', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    default: vi.fn().mockImplementation(() => ({
      ...(actual as any).default,
      externalWalletLogin: mockExternalWalletLogin,
      logout: mockLogout,
    })),
  };
});
