import { Wallet } from '@getpara/web-sdk';

export const API_KEY = 'api-key-123';

export const TEST_EMAIL = 'test@test.com';
export const TEST_PHONE = '+13105551234';
export const TEST_FARCASTER_USERNAME = 'test-farcaster-username';
export const TEST_TELEGRAM_USER_ID = '123456789';
export const TEST_EXTERNAL_WALLET_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

export const TEST_WALLET: Omit<Wallet, 'signer'> = {
  id: 'test-id',
  address: '0x1a5FdBc891c5D4E6aD68064Ae45D43146D4F9f3a',
  type: 'EVM',
  name: 'Test Wallet',
};

export const TEST_WALLETS = { [TEST_WALLET.id]: TEST_WALLET as Wallet };
export const TEST_CURRENT_WALLET_IDS = { EVM: [TEST_WALLET.id] };

export const TEST_USER_ID = '123456';
