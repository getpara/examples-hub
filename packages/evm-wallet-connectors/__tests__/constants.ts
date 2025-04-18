import { Wallet } from '@getpara/web-sdk';

export const API_KEY = 'api-key-123';

export const TEST_WALLET: Omit<Wallet, 'signer'> = {
  id: 'test-id',
  address: '0x1a5FdBc891c5D4E6aD68064Ae45D43146D4F9f3a',
  type: 'EVM',
  name: 'Test Wallet',
  isExternal: true,
};

export const TEST_USER_ID = '123456';
