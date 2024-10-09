import { WalletType } from '@usecapsule/user-management-client';

export const USER_ID = 'ef3bf91c-fc1e-4d18-afe2-f2654c9531e5';

export const API_KEY = 'api-key-123';

export const EXTERNAL_WALLET = {
  address: '0x1aD2B053b8c6b1592cB645DEfadf105F34d8C6e1',
  type: WalletType.EVM,
  provider: 'metamask',
};

export const STORED_EXTERNAL_WALLET = {
  id: EXTERNAL_WALLET.address,
  address: EXTERNAL_WALLET.address,
  type: EXTERNAL_WALLET.type,
  name: EXTERNAL_WALLET.provider,
  isExternal: true,
  signer: '',
};
