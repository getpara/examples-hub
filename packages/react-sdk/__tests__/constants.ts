import { Wallet, WalletType } from '@getpara/web-sdk';

export const API_KEY = 'api-key-123';

export const TEST_EMAIL = 'test@test.com';

export const TEST_WALLET: Omit<Wallet, 'signer'> = {
  id: 'test-id',
  address: '0x1a5FdBc891c5D4E6aD68064Ae45D43146D4F9f3a',
  type: WalletType.EVM,
  name: 'Test Wallet',
};

export const TEST_WALLETS = { [TEST_WALLET.id]: TEST_WALLET as Wallet };
export const TEST_CURRENT_WALLET_IDS = { [WalletType.EVM]: [TEST_WALLET.id] };

export const TEST_USER_ID = '123456';
