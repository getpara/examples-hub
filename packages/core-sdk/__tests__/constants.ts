import { WalletType } from '@usecapsule/user-management-client';

export const USER_ID = 'ef3bf91c-fc1e-4d18-afe2-f2654c9531e5';
export const USER_EMAIL = 'test@test.com';
export const USER_PHONE = '5555555555';
export const USER_COUNTRY_CODE = '1';
export const USER_FARCASTER_USERNAME = 'TestFarcaster';

export const VERIFICATION_CODE = '123456';

export const SESSION_ID = 'ef3bf91c-fc1e-4d18-afe2-f2654c9531c3';
export const SESSION_LOOKUP_ID = 'ef3bf91c-fc1e-4d18-afe2-f2654c9531c5';
export const TEMP_TRANSMISSION_INIT_ID = 'ef3bf91c-fc1e-4d18-afe2-f2654c9531t1';

export const FARCASTER_CONNECT_URI = 'https://test.com/test-farcaster-connect';

export const API_KEY = 'api-key-123';
export const PARTNER = {
  id: 'ef3bf91c-fc1e-4d18-afe2-f2654c9531b4',
  portalUrl: 'https://test.com',
  apiKey: API_KEY,
  font: 'roboto',
  themeMode: 'light',
  accentColor: 'blue',
  foregroundColor: 'black',
  backgroundColor: 'white',
  supportedWalletTypes: [
    { type: WalletType.EVM, optional: false },
    { type: WalletType.SOLANA, optional: false },
  ],
  cosmosPrefix: 'test',
};

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

export const LOGIN_ERROR = 'Login Error';

export const WALLET = {
  address: '0x1aD2B053b8c6b1592cB645DEfadf105F34d8C6p0',
  createdAt: '2024-10-22T00:00:00.000Z',
  isPregen: false,
  pregenIdentifier: null,
  pregenIdentifierType: null,
  id: 'ef3bf91c-fc1e-4d18-afe2-f2654c9556f8',
  keyGenComplete: true,
  name: 'Test Wallet',
  partnerId: PARTNER.id,
  partner: PARTNER,
  publicKey: '0x1aD2B053b8c6b1592cB645DEfadf105F34d8C6p1',
  scheme: 'DKLS',
  type: WalletType.EVM,
  updatedAt: '2024-10-22T00:00:00.000Z',
  userId: USER_ID,
  lastUsedAt: '2024-10-22T00:00:00.000Z',
  lastUsedPartnerId: PARTNER.id,
  lastUsedPartner: PARTNER,
};
export const WALLET_KEYGEN_RES = {
  walletId: WALLET.id,
  signer: 'test-wallet-signer',
};
export const SOLANA_WALLET = {
  ...WALLET,
  address: '0x1aD2B053b8c6b1592cB645DEfadf105F34d8C6t9',
  id: 'ef3bf91c-fc1e-4d18-afe2-f2654c9556t9',
  name: 'Test Solana Wallet',
  type: WalletType.SOLANA,
  scheme: 'ED25519',
};
export const SOLANA_WALLET_KEYGEN_RES = {
  walletId: SOLANA_WALLET.id,
  signer: 'test-solana-wallet-signer',
};
export const WALLETS = [WALLET, SOLANA_WALLET];

export const PREGEN_WALLET_EMAIL = {
  address: '0x1aD2B053b8c6b1592cB645DEfadf105F34d8C6p3',
  createdAt: '2024-10-22T00:00:00.000Z',
  isPregen: true,
  pregenIdentifier: USER_EMAIL,
  pregenIdentifierType: 'EMAIL',
  id: 'ef3bf91c-fc1e-4d18-afe2-f2654c9556l0',
  keyGenComplete: true,
  name: 'Test Pregen Email Wallet',
  partnerId: PARTNER.id,
  partner: PARTNER,
  publicKey: '0x1aD2B053b8c6b1592cB645DEfadf105F34d8C6p4',
  scheme: 'DKLS',
  type: WalletType.EVM,
  updatedAt: '2024-10-22T00:00:00.000Z',
  userId: USER_ID,
  lastUsedAt: '2024-10-22T00:00:00.000Z',
  lastUsedPartnerId: PARTNER.id,
  lastUsedPartner: PARTNER,
};
export const SOLANA_PREGEN_WALLET_EMAIL = {
  ...PREGEN_WALLET_EMAIL,
  address: '0x1aD2B053b8c6b1592cB645DEfadf105F34d8C6e5',
  id: 'ef3bf91c-fc1e-4d18-afe2-f2654c9556e5',
  name: 'Test Solana Pregen Wallet',
  type: WalletType.SOLANA,
  scheme: 'ED25519',
};
export const SOLANA_PREGEN_WALLET_KEYGEN_RES = {
  walletId: SOLANA_PREGEN_WALLET_EMAIL.id,
  signer: 'test-solana-pregen-wallet-signer',
};
export const PREGEN_WALLET_EMAIL_KEYGEN_RES = {
  walletId: PREGEN_WALLET_EMAIL.id,
  signer: 'test-pregen-wallet-email-signer',
};
export const PREGEN_WALLET_PHONE = {
  address: '0x1aD2B053b8c6b1592cB645DEfadf105F34d8C6p5',
  createdAt: '2024-10-22T00:00:00.000Z',
  isPregen: true,
  pregenIdentifier: `${USER_COUNTRY_CODE}${USER_PHONE}`,
  pregenIdentifierType: 'PHONE',
  id: 'ef3bf91c-fc1e-4d18-afe2-f2654c9556m6',
  keyGenComplete: true,
  name: 'Test Pregen Phone Wallet',
  partnerId: PARTNER.id,
  partner: PARTNER,
  publicKey: '0x1aD2B053b8c6b1592cB645DEfadf105F34d8C6p6',
  scheme: 'DKLS',
  type: WalletType.EVM,
  updatedAt: '2024-10-22T00:00:00.000Z',
  userId: USER_ID,
  lastUsedAt: '2024-10-22T00:00:00.000Z',
  lastUsedPartnerId: PARTNER.id,
  lastUsedPartner: PARTNER,
};
export const PREGEN_WALLET_PHONE_KEYGEN_RES = {
  walletId: PREGEN_WALLET_PHONE.id,
  signer: 'test-pregen-wallet-phone-signer',
};
export const PREGEN_WALLETS_EMAIL = [PREGEN_WALLET_EMAIL, SOLANA_PREGEN_WALLET_EMAIL];
export const PREGEN_WALLETS_PHONE = [PREGEN_WALLET_PHONE];

export const SESSION_PUBLIC_KEYS = [
  {
    id: 'ef3bf91c-fc1e-4d18-afe2-f2654c9556q0',
    publicKey:
      '8822c2c21963edb05eb4a0a06aced3d683ecd00296e34d30f1d75d14109cc51a9e47ec15c7ec72366383d89a21b3905b84411ad430988ea53aa89ff71ad929fc',
    sigDerivedPublicKey:
      '2d2d2d2d2d424547494e205055424c4943204b45592d2d2d2d2d0d0a4d4947654d413047435371475349623344514542415155414134474d4144434269414b426747364f3367346b4b4b34304b4a6c4f705049575233384c6453494d0d0a2b374c6e59732b766f51682f2b53542b6569556d32333175764c727570766b7356796232457451714d64394a585a44684e38316d7a343757334f3336633232760d0a334569324a784730742b5654792b79424553523173677649394779497432414264683033444d4f766b6949663167426231694b654774795a576f6133412f354b0d0a416257436833534c4c35585a336c4a7041674d424141453d0d0a2d2d2d2d2d454e44205055424c4943204b45592d2d2d2d2d',
  },
];
export const RECOVERY_PUBLIC_KEYS = [
  {
    id: 'ef3bf91c-fc1e-4d18-afe2-f2654c9556q1',
    publicKey:
      '8822c2c21963edb05eb4a0a06aced3d683ecd00296e34d30f1d75d14109cc51a9e47ec15c7ec72366383d89a21b3905b84411ad430988ea53aa89ff71ad929fb',
    sigDerivedPublicKey:
      '2d2d2d2d2d424547494e205055424c4943204b45592d2d2d2d2d0d0a4d4947664d413047435371475349623344514542415155414134474e4144434269514b426751437a74355356317362694f31577062307041704a753761686c7a0d0a586f4c4a53564c4843445872656d622b41534664414f5936797849734f4245615858747858574d7a43754d476e4373465a4755645877342b6b354c41335743340d0a41634c675a2b39384c464d455679384a387545324b503364666d7946506d5547784a507a4f65444743317a4a6b4c64467634486d63774e54664f63764c42396b0d0a4176385076484a42714331414145725964774944415141420d0a2d2d2d2d2d454e44205055424c4943204b45592d2d2d2d2d',
  },
];

export const SHARES = [
  {
    walletId: WALLET.id,
    encryptedShare: '',
    encryptedKey: '',
  },
  {
    walletId: SOLANA_WALLET.id,
    encryptedShare: '',
    encryptedKey: '',
  },
];
