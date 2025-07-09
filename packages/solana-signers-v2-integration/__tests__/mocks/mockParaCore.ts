import { vi } from 'vitest';
import { type ParaCore, type Wallet } from '@getpara/core-sdk';

export const mockSignMessage = vi.fn().mockResolvedValue({
  signature: 'bW9ja2VkU2lnbmF0dXJlMHgxMjM0NTY3ODkwYWJjZGVm', // base64 encoded
  walletId: 'mock-wallet-id',
});

const mockWallet = {
  id: 'mock-wallet-id',
  userId: 'mock-user-id',
  blockchainType: 'SOL',
  address: '8B9XQoXGqhg8uZ8tVQzqr1pe8rNgnJNURQNqS3nwJooN',
  walletTags: [],
  name: 'Test Solana Wallet',
  signerType: 'SOLANA',
  hidden: false,
  createdAt: new Date(),
  scheme: 'ed25519',
} as Wallet;

export const mockFindWalletId = vi.fn().mockReturnValue('mock-wallet-id');

export const mockPara = {
  signMessage: mockSignMessage,
  findWalletId: mockFindWalletId,
  wallets: {
    'mock-wallet-id': mockWallet,
  },
} as unknown as ParaCore;

export class MockTransactionReviewError extends Error {
  constructor(public reviewUrl: string) {
    super('Transaction review required');
    this.name = 'TransactionReviewError';
  }
}

vi.mock('@getpara/core-sdk', () => ({
  default: vi.fn(() => mockPara),
  ParaCore: vi.fn(() => mockPara),
  TransactionReviewError: MockTransactionReviewError,
}));
