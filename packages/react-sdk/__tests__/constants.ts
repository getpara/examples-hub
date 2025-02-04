import { Wallet } from '@getpara/web-sdk';

export const API_KEY = 'api-key-123';

export const TEST_EMAIL = 'test@test.com';

export const TEST_WALLET: Omit<Wallet, 'signer'> = {
  id: 'test-id',
};

export const TEST_WALLETS = { [TEST_WALLET.id]: TEST_WALLET as Wallet };
