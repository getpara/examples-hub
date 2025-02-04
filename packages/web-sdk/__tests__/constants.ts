export const TEST_ATTESTATION_OBJECT_STRING =
  'o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViUSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAOqbjWZNAR0hPOS2tIy1ddQAEOl4k2_NL6J6XSVAbOrEaB6lAQIDJiABIVggrfurzIAxEiPGnbbbemuaR6ahaJV_C9LmkhcmHNfwvRwiWCAJanyoXQJie8zGozU2NESEYC-uew5TO8N58hzDJHtM3g';
export const TEST_COSE_PUBLIC_KEY =
  'BK37q8yAMRIjxp2223prmkemoWiVfwvS5pIXJhzX8L0cCWp8qF0CYnvMxqM1NjREhGAvrnsOUzvDefIcwyR7TN4';
export const TEST_AAGUID = 'ea9b8d664d011d213ce4b6b48cb575d4';
export const TEST_CLIENT_DATA_JSON = {};

export const USER = {
  id: 'ef3bf91c-fc1e-4d18-afe2-f2654c9531e5',
  email: 'test@test.com',
  sessionCookie: 'test-session-cookie',
};
export const COSMOS_PREFIX = 'test';
export const SHARE = { id: 'test-share', disableWebSockets: false };
export const PARA_SHARE = 'test-para-share';
export const WALLET = {
  address: '0x1aD2B053b8c6b1592cB645DEfadf105F34d8C6p0',
  createdAt: '2024-10-22T00:00:00.000Z',
  id: 'ef3bf91c-fc1e-4d18-afe2-f2654c9556f8',
  signer: 'test-wallet-signer',
  share: JSON.stringify(SHARE),
  privateKey: 'test-wallet-pk',
  protocolId: 'test-protocol-id',
  preExistingProtocolId: 'test-pre-existing-protocol-id',
  pendingTransactionId: 'test-pending-tx-id',
};
export const WALLETS = [WALLET];
export const SESSION_PUBLIC_KEYS = [
  {
    id: 'ef3bf91c-fc1e-4d18-afe2-f2654c9556q0',
    publicKey:
      '8822c2c21963edb05eb4a0a06aced3d683ecd00296e34d30f1d75d14109cc51a9e47ec15c7ec72366383d89a21b3905b84411ad430988ea53aa89ff71ad929fc',
    sigDerivedPublicKey:
      '2d2d2d2d2d424547494e205055424c4943204b45592d2d2d2d2d0d0a4d4947654d413047435371475349623344514542415155414134474d4144434269414b426747364f3367346b4b4b34304b4a6c4f705049575233384c6453494d0d0a2b374c6e59732b766f51682f2b53542b6569556d32333175764c727570766b7356796232457451714d64394a585a44684e38316d7a343757334f3336633232760d0a334569324a784730742b5654792b79424553523173677649394779497432414264683033444d4f766b6949663167426231694b654774795a576f6133412f354b0d0a416257436833534c4c35585a336c4a7041674d424141453d0d0a2d2d2d2d2d454e44205055424c4943204b45592d2d2d2d2d',
  },
];
export const RECOVERY_SHARE = 'test-recovery-share';

export const PREGEN_WALLET = {
  address: '0x1aD2B053b8c6b1592cB645DEfadf105F34d8C6p3',
  createdAt: '2024-10-22T00:00:00.000Z',
  isPregen: true,
  pregenIdentifier: USER.email,
  pregenIdentifierType: 'EMAIL',
  id: 'ef3bf91c-fc1e-4d18-afe2-f2654c9556l0',
  signer: 'test-pregen-wallet-signer',
};

export const PARTNER = {
  id: 'ef3bf91c-fc1e-4d18-afe2-f2654c9531b4',
  apiKey: 'test-api-key',
};

export const SECRET_KEY = 'test-secret-key';
export const BASE64_BYTES = 'test-b64-bytes';
export const MESSAGE = 'test-msg';
export const TX = 'test-tx';
export const CHAIN = 'test-chain';
export const SIGNATURE = 'test-signature';
export const BASE64_SIGNATURE = 'test-b64-signature';
export const OFFLOAD_MPC_COMPUTATION_URL = 'test-mpc-url';
export const COSMOS_SIGN_DOC = 'test-cosmos-signing-doc';

export const WINDOW_INNER_HEIGHT = 1000;
export const WINDOW_INNER_WIDTH = 1000;
