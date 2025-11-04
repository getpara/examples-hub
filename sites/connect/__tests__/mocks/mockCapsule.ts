import { vi } from 'vitest';

export const mockCapsuleClient = {
  isFullyLoggedIn: vi.fn().mockReturnValue(false),
  login: vi.fn().mockResolvedValue({}),
  logout: vi.fn().mockResolvedValue(undefined),
  createWallet: vi.fn().mockResolvedValue({
    id: 'wallet-id',
    address: '0x1234567890123456789012345678901234567890',
    publicKey: 'public-key',
  }),
  getWallets: vi.fn().mockResolvedValue([]),
  signMessage: vi.fn().mockResolvedValue('signature'),
  signTransaction: vi.fn().mockResolvedValue('signed-tx'),
  getUserShare: vi.fn().mockResolvedValue('user-share'),
  setUserShare: vi.fn().mockResolvedValue(undefined),
  generateRecoverySecret: vi.fn().mockResolvedValue('recovery-secret'),
  verifyMessage: vi.fn().mockResolvedValue(true),
  exportPrivateKey: vi.fn().mockResolvedValue('private-key'),
  getBalance: vi.fn().mockResolvedValue('0'),
  sendTransaction: vi.fn().mockResolvedValue('tx-hash'),
};

export const createMockCapsule = () => mockCapsuleClient;
