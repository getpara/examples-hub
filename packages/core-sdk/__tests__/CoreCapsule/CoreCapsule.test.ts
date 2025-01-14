import { describe, vi, afterEach, expect, it, beforeAll } from 'vitest';

import CoreCapsule, {
  AuthMethod,
  Environment,
  getBaseUrl,
  getPortalBaseURL,
  getPublicKeyHex,
  OAuthMethod,
  PopupType,
  SuccessfulSignatureRes,
} from '../../src/index.js';
import {
  API_KEY,
  EXTERNAL_WALLET,
  PARTNER,
  SESSION_ID,
  STORED_EXTERNAL_WALLET,
  USER_COUNTRY_CODE,
  USER_EMAIL,
  USER_ID,
  USER_PHONE,
  VERIFICATION_CODE,
  TEMP_TRANSMISSION_INIT_ID,
  FARCASTER_CONNECT_URI,
  USER_FARCASTER_USERNAME,
  SESSION_LOOKUP_ID,
  LOGIN_ERROR,
  WALLET,
  PREGEN_WALLETS_EMAIL,
  PREGEN_WALLET_EMAIL,
  SOLANA_WALLET,
  SOLANA_PREGEN_WALLET_EMAIL,
  WALLETS,
  SHARES,
  PREGEN_WALLETS_PHONE,
  PREGEN_WALLET_PHONE_KEYGEN_RES,
  PREGEN_WALLET_PHONE,
  TWOFA_URI,
  TWOFA_VERIFY_RESP,
  TRANSACTION_ID,
  TIMEOUT_MS,
  PURCHASE_ID,
  CURRENT_WALLET_IDS,
  USER_TELEGRAM_AUTH_OBJECT,
} from '../constants';
import { MockCapsule } from '../mocks/mockCoreCapsule.js';
import {
  mockAddSessionPublicKey,
  mockCheck2FAStatus,
  mockCheckUserExists,
  mockCreateOnRampPurchase,
  mockCreateUser,
  mockDistributeCapsuleShare,
  mockEnable2FA,
  mockExternalWalletLogin,
  mockGetFarcasterAuthStatus,
  mockGetPregenWallets,
  mockGetTransmissionKeyshares,
  mockGetWallets,
  mockKeepSessionAlive,
  mockTouchSession,
  mockUpdatePregenWallet,
  mockVerify2FA,
  mockVerify2FAForPhone,
  mockVerifyEmail,
  mockVerifyPhone,
} from '../mocks/mockUserManagementClient';
import { CountryCallingCode } from 'libphonenumber-js';
import {
  Network,
  OnRampAsset,
  OnRampProvider,
  OnRampPurchaseType,
  PublicKeyStatus,
  PublicKeyType,
  WalletType,
} from '@usecapsule/user-management-client';
import { PregenIdentifierType, Wallet } from '../../src/CoreCapsule.js';
import { getWorkerContent } from '../utils.js';
import { mockPreKeygen } from '../mocks/mockPlatformUtils.js';
import '../mocks/mockCryptographyUtils.js';
import '../mocks/mockUserManagementClient.js';
import * as shareDistribution from '../../src/shares/shareDistribution.js';

const COMMON_SEARCH_PARAMS = {
  partnerId: PARTNER.id,
  portalAccentColor: PARTNER.accentColor,
  portalBackgroundColor: PARTNER.backgroundColor,
  portalFont: PARTNER.font,
  portalForegroundColor: PARTNER.foregroundColor,
  portalThemeMode: PARTNER.themeMode,
};

function searchParamsToObject(url: URL): Record<string, string> {
  const obj: Record<string, string> = {};

  for (const [key, value] of url.searchParams.entries()) {
    obj[key] = value;
  }

  return obj;
}

function expectSearchParams(url: URL, expected: Record<string, string>): void {
  const searchParams = searchParamsToObject(url);

  expect(searchParams).toEqual(expected);
}
vi.mock('../../src/cryptography/utils', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    decryptWithPrivateKey: vi.fn(),
  };
});

// const { mockDistributeNewShare } = vi.hoisted(() => {
//   return { mockDistributeNewShare: vi.fn().mockResolvedValue('recoverySecret') };
// });

vi.mock('../../src/shares/shareDistribution', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    distributeNewShare: vi.fn().mockImplementation((actual as any).distributeNewShare),
  };
});

describe('CoreCapsule', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('creates a new instance of CoreCapsule with correct fields', () => {
      const capsule = new MockCapsule(Environment.DEV, API_KEY);

      expect(capsule).toBeInstanceOf(CoreCapsule);
      expect(capsule.ctx.env).toBe(Environment.DEV);
      expect(capsule.ctx.apiKey).toBe(API_KEY);
      expect(capsule.wallets).toEqual({});
      expect(capsule.externalWallets).toEqual({});
      expect(capsule.currentExternalWalletAddresses).toBeUndefined();

      // casting as any to access protected fields
      expect((capsule as any).supportedWalletTypes).toEqual([]);
    });

    it('supportedWalletTypes option', () => {
      let capsule = new MockCapsule(Environment.DEV, API_KEY, {
        supportedWalletTypes: { [WalletType.EVM]: { optional: true } },
      });

      expect(capsule.supportedWalletTypes).toEqual([]);

      capsule = new MockCapsule(Environment.DEV, API_KEY, {
        supportedWalletTypes: { ['FOO' as unknown as WalletType]: true },
      });

      expect(capsule.supportedWalletTypes).toEqual([]);

      capsule = new MockCapsule(Environment.DEV, API_KEY, {
        supportedWalletTypes: { [WalletType.EVM]: true, [WalletType.COSMOS]: { optional: true, prefix: 'celestia' } },
      });

      expect(capsule.supportedWalletTypes).toEqual([
        { type: WalletType.EVM, optional: false },
        { type: WalletType.COSMOS, optional: true },
      ]);

      expect(capsule.cosmosPrefix).toEqual('celestia');

      // casting as any to access protected fields
    });

    it('useStorageOverrides option', () => {
      const opts = {
        useStorageOverrides: true,
        localStorageGetItemOverride: () => Promise.resolve('test'),
        localStorageSetItemOverride: () => Promise.resolve(),
        sessionStorageGetItemOverride: () => Promise.resolve('test'),
        sessionStorageSetItemOverride: () => Promise.resolve(),
        clearStorageOverride: () => Promise.resolve(),
      };
      let capsule = new MockCapsule(Environment.DEV, API_KEY, opts);

      expect(capsule).toBeDefined();
      expect((capsule as unknown as any).localStorageGetItem).toEqual(opts.localStorageGetItemOverride);
      expect((capsule as unknown as any).localStorageSetItem).toEqual(opts.localStorageSetItemOverride);
      expect((capsule as unknown as any).sessionStorageGetItem).toEqual(opts.sessionStorageGetItemOverride);
      expect((capsule as unknown as any).sessionStorageSetItem).toEqual(opts.sessionStorageSetItemOverride);
      expect((capsule as unknown as any).clearStorage).toEqual(opts.clearStorageOverride);
    });
  });
  describe('external wallets', () => {
    it('logs in successfully', async () => {
      const capsule = new MockCapsule(Environment.DEV, API_KEY);

      const { address, type, provider } = EXTERNAL_WALLET;

      await capsule.externalWalletLogin(address, type, provider);

      const isFullyLoggedIn = await capsule.isFullyLoggedIn();
      const isSessionActive = await capsule.isSessionActive();

      expect(capsule.externalWallets).toEqual({
        [address]: STORED_EXTERNAL_WALLET,
      });
      expect(capsule.currentExternalWalletAddresses).toEqual([address]);
      expect(capsule.isUsingExternalWallet()).toBeTruthy();
      expect(isFullyLoggedIn).toBeTruthy();
      expect(isSessionActive).toBeTruthy();
    });
    it('log in fails', async () => {
      const capsule = new MockCapsule(Environment.DEV, API_KEY);

      const { address, type, provider } = EXTERNAL_WALLET;

      mockExternalWalletLogin.mockRejectedValueOnce(LOGIN_ERROR);

      await expect(capsule.externalWalletLogin(address, type, provider)).rejects.toThrowError(LOGIN_ERROR);

      expect(capsule.externalWallets).toEqual({});
      expect(capsule.currentExternalWalletAddresses).toBeUndefined();
    });
    it('logs out and clears external wallets', async () => {
      const capsule = new MockCapsule(Environment.DEV, API_KEY);

      const { address, type, provider } = EXTERNAL_WALLET;

      await capsule.externalWalletLogin(address, type, provider);

      expect(capsule.externalWallets).toEqual({
        [address]: STORED_EXTERNAL_WALLET,
      });
      expect(capsule.currentExternalWalletAddresses).toEqual([address]);

      await capsule.logout();

      expect(capsule.externalWallets).toEqual({});
      expect(capsule.currentExternalWalletAddresses).toBeUndefined();
    });
    it('util functions', async () => {
      const capsule = new MockCapsule(Environment.DEV, API_KEY);

      const { address, type, provider } = EXTERNAL_WALLET;

      await capsule.externalWalletLogin(address, type, provider);

      expect(capsule.externalWallets).toEqual({
        [address]: STORED_EXTERNAL_WALLET,
      });
      expect(capsule.currentExternalWalletAddresses).toEqual([address]);

      const displayAddress = capsule.getDisplayAddress(address);
      expect(displayAddress).toEqual(address);

      const identiconHash = capsule.getIdenticonHash(address);
      expect(identiconHash).toEqual(`${address}-${address}-${type}`);

      const foundWalletByAddress = capsule.findWalletByAddress(address);
      expect(foundWalletByAddress).toEqual(STORED_EXTERNAL_WALLET);

      const foundWallet = capsule.findWallet(address);
      expect(foundWallet).toEqual(STORED_EXTERNAL_WALLET);

      const foundWalletNoAddress = capsule.findWallet();
      expect(foundWalletNoAddress).toEqual(STORED_EXTERNAL_WALLET);
    });
  });
  describe('create user', () => {
    describe('email', () => {
      it('creates a new user', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const userExists = await capsule.checkIfUserExists(USER_EMAIL);

        expect(mockCheckUserExists).toBeCalledWith({ email: USER_EMAIL });
        expect(userExists).toBeTruthy();

        await capsule.createUser(USER_EMAIL);

        expect(mockCreateUser).toBeCalledWith({
          email: USER_EMAIL,
        });

        expect(capsule.getEmail()).toEqual(USER_EMAIL);
        expect(capsule.getUserId()).toEqual(USER_ID);
      });
      it("user doesn't exists", async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        mockCheckUserExists.mockResolvedValueOnce({ data: { exists: false } });

        const userExists = await capsule.checkIfUserExists(USER_EMAIL);

        expect(mockCheckUserExists).toBeCalledWith({ email: USER_EMAIL });
        expect(userExists).toBeFalsy();
      });
      it('verify', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        await capsule.createUser(USER_EMAIL);

        const verifyRes = await capsule.verifyEmail(VERIFICATION_CODE);

        expect(mockVerifyEmail).toBeCalledWith(USER_ID, { verificationCode: VERIFICATION_CODE });
        expect(mockAddSessionPublicKey).toBeCalledWith(USER_ID, {
          status: PublicKeyStatus.PENDING,
          type: PublicKeyType.WEB,
        });

        const url = new URL(verifyRes);

        expect(url.origin).toEqual(PARTNER.portalUrl);
        expect(url.pathname).toEqual(`/web/users/${USER_ID}/biometrics/${SESSION_ID}`);
        expectSearchParams(url, {
          ...COMMON_SEARCH_PARAMS,
          apiKey: PARTNER.apiKey,
          email: USER_EMAIL,
        });
      });
      it('logs out and clears user data', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        await capsule.createUser(USER_EMAIL);

        expect(capsule.getEmail()).toEqual(USER_EMAIL);
        expect(capsule.getUserId()).toEqual(USER_ID);

        await capsule.logout();

        expect(capsule.getEmail()).toBeUndefined();
        expect(capsule.getUserId()).toBeUndefined();
      });
      it('logs out and preserves pregen wallets', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const pregenWallets = { [PREGEN_WALLETS_EMAIL[0].id]: { ...PREGEN_WALLETS_EMAIL[0] } };
        const userWallets = { [WALLET.id]: { ...WALLET } };

        await capsule.setWallets({ ...userWallets, ...pregenWallets } as unknown as Record<string, Wallet>);

        await capsule.logout(true);

        expect(capsule.wallets).toEqual(pregenWallets);
      });
    });
    describe('phone', () => {
      it('creates a new user', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const userExists = await capsule.checkIfUserExistsByPhone(USER_PHONE, USER_COUNTRY_CODE as CountryCallingCode);

        expect(mockCheckUserExists).toBeCalledWith({ phone: USER_PHONE, countryCode: USER_COUNTRY_CODE });
        expect(userExists).toBeTruthy();

        await capsule.createUserByPhone(USER_PHONE, USER_COUNTRY_CODE as CountryCallingCode);

        expect(mockCreateUser).toBeCalledWith({
          phone: USER_PHONE,
          countryCode: USER_COUNTRY_CODE,
        });

        expect(capsule.getPhone()).toEqual({
          phone: USER_PHONE,
          countryCode: USER_COUNTRY_CODE,
        });
        expect(capsule.getPhoneNumber()).toEqual(`+${USER_COUNTRY_CODE}${USER_PHONE}`);
        expect(capsule.getUserId()).toEqual(USER_ID);
      });

      it("user doesn't", async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        mockCheckUserExists.mockResolvedValueOnce({ data: { exists: false } });

        const userExists = await capsule.checkIfUserExistsByPhone(USER_PHONE, USER_COUNTRY_CODE as CountryCallingCode);

        expect(mockCheckUserExists).toBeCalledWith({ phone: USER_PHONE, countryCode: USER_COUNTRY_CODE });
        expect(userExists).toBeFalsy();
      });
      it('verify', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        await capsule.createUserByPhone(USER_PHONE, USER_COUNTRY_CODE as CountryCallingCode);

        const verifyRes = await capsule.verifyPhone(VERIFICATION_CODE);

        expect(mockVerifyPhone).toBeCalledWith(USER_ID, { verificationCode: VERIFICATION_CODE });
        expect(mockAddSessionPublicKey).toBeCalledWith(USER_ID, {
          status: PublicKeyStatus.PENDING,
          type: PublicKeyType.WEB,
        });

        const url = new URL(verifyRes);

        expect(url.origin).toEqual(PARTNER.portalUrl);
        expect(url.pathname).toEqual(`/web/users/${USER_ID}/biometrics/${SESSION_ID}`);
        expectSearchParams(url, {
          ...COMMON_SEARCH_PARAMS,
          apiKey: PARTNER.apiKey,
          countryCode: USER_COUNTRY_CODE,
          phone: USER_PHONE,
        });
      });
      it('logs out and clears user data', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        await capsule.createUserByPhone(USER_PHONE, USER_COUNTRY_CODE as CountryCallingCode);

        expect(capsule.getPhone()).toEqual({
          phone: USER_PHONE,
          countryCode: USER_COUNTRY_CODE,
        });
        expect(capsule.getPhoneNumber()).toEqual(`+${USER_COUNTRY_CODE}${USER_PHONE}`);
        expect(capsule.getUserId()).toEqual(USER_ID);

        await capsule.logout();

        expect(capsule.getPhone()).toEqual({
          phone: undefined,
          countryCode: undefined,
        });
        expect(capsule.getPhoneNumber()).toBeUndefined();
        expect(capsule.getUserId()).toBeUndefined();
      });
    });
  });
  describe('login', { timeout: 25000 }, () => {
    describe('email', () => {
      it('initiates login', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginRes = await capsule.initiateUserLogin(USER_EMAIL);
        const isEmail = await capsule.isEmail;

        const url = new URL(loginRes);

        expect(isEmail).toBeTruthy();
        expect(url.origin).toEqual(PARTNER.portalUrl);
        expect(url.pathname).toEqual('/web/biometrics/login');
        expectSearchParams(url, {
          ...COMMON_SEARCH_PARAMS,
          apiKey: PARTNER.apiKey,
          email: USER_EMAIL,
          encryptionKey: getPublicKeyHex(capsule.loginEncryptionKeyPair!),
          sessionId: SESSION_ID,
          pregenIds: '{}',
        });
      });
      it('initiates login - short url', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginLink = await capsule.initiateUserLogin(USER_EMAIL, true);

        const url = new URL(loginLink);
        expect(url.origin).toEqual('http://localhost:3003');
        expect(url.pathname).toContain(`/short/${TEMP_TRANSMISSION_INIT_ID}`);
      });
      it('initiates loginV2', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginRes = await capsule.initiateUserLoginV2(USER_EMAIL, 'email');

        expect(loginRes.has(AuthMethod.PASSKEY)).toBeTruthy();
        expect(loginRes.has(AuthMethod.PASSWORD)).toBeTruthy();
      });
    });
    describe('phone', () => {
      it('initiates login', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginRes = await capsule.initiateUserLogin(
          USER_PHONE,
          false,
          'phone',
          USER_COUNTRY_CODE as CountryCallingCode,
        );

        const isPhone = await capsule.isPhone;

        const url = new URL(loginRes);

        expect(isPhone).toBeTruthy();
        expect(url.origin).toEqual(PARTNER.portalUrl);
        expect(url.pathname).toEqual('/web/biometrics/login');
        expectSearchParams(url, {
          ...COMMON_SEARCH_PARAMS,
          apiKey: PARTNER.apiKey,
          countryCode: USER_COUNTRY_CODE,
          encryptionKey: getPublicKeyHex(capsule.loginEncryptionKeyPair!),
          phone: USER_PHONE,
          sessionId: SESSION_ID,
          pregenIds: '{}',
        });
      });
      it('initiates login - phone only method', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginRes = await capsule.initiateUserLoginForPhone(USER_PHONE, USER_COUNTRY_CODE as CountryCallingCode);

        const url = new URL(loginRes);

        expect(url.origin).toEqual(PARTNER.portalUrl);
        expect(url.pathname).toEqual('/web/biometrics/login');
        expectSearchParams(url, {
          ...COMMON_SEARCH_PARAMS,
          apiKey: PARTNER.apiKey,
          countryCode: USER_COUNTRY_CODE,
          encryptionKey: getPublicKeyHex(capsule.loginEncryptionKeyPair!),
          phone: USER_PHONE,
          sessionId: SESSION_ID,
          pregenIds: '{}',
        });
      });
      it('initiates loginV2', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginRes = await capsule.initiateUserLoginV2(USER_PHONE, 'phone', USER_COUNTRY_CODE as CountryCallingCode);

        expect(loginRes.has(AuthMethod.PASSKEY)).toBeTruthy();
        expect(loginRes.has(AuthMethod.PASSWORD)).toBeTruthy();
      });
    });
    describe('farcaster', () => {
      it('get connect url', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const uri = await capsule.getFarcasterConnectURL();

        expect(uri).toEqual(FARCASTER_CONNECT_URI);
      });
      it('logs in user', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const { userExists, username } = await capsule.waitForFarcasterStatus();

        const farcasterUsername = await capsule.getFarcasterUsername();
        const isFarcaster = await capsule.isFarcaster;

        expect(userExists).toBeTruthy();
        expect(username).toEqual(USER_FARCASTER_USERNAME);
        expect(farcasterUsername).toEqual(USER_FARCASTER_USERNAME);
        expect(isFarcaster).toBeTruthy();
        expect(capsule.getUserId()).toEqual(USER_ID);
      });
      it('wait for login fails', async () => {
        mockGetFarcasterAuthStatus.mockRejectedValueOnce(LOGIN_ERROR);

        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const waitResp = await capsule.waitForFarcasterStatus();

        await expect(waitResp).toBeUndefined();
      });
      it('initiates loginV2', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginRes = await capsule.initiateUserLoginV2(USER_FARCASTER_USERNAME, 'farcaster');

        expect(loginRes.has(AuthMethod.PASSKEY)).toBeTruthy();
        expect(loginRes.has(AuthMethod.PASSWORD)).toBeTruthy();
      });
    });
    describe('telegram', () => {
      it('logs in user', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const { isValid, telegramUserId, userId } = await capsule.verifyTelegram(USER_TELEGRAM_AUTH_OBJECT);

        expect(isValid).toEqual(true);
        expect(telegramUserId).toEqual(USER_TELEGRAM_AUTH_OBJECT.id.toString());
        expect(userId).toEqual(USER_ID);

        expect(capsule.isTelegram).toBeTruthy();
        expect(capsule.telegramUserId).toEqual(USER_TELEGRAM_AUTH_OBJECT.id.toString());
        expect(capsule.getUserId()).toEqual(USER_ID);
      });
      it('initiates loginV2', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginRes = await capsule.initiateUserLoginV2(USER_TELEGRAM_AUTH_OBJECT.id.toString(), 'telegram');

        expect(loginRes.has(AuthMethod.PASSKEY)).toBeTruthy();
        expect(loginRes.has(AuthMethod.PASSWORD)).toBeTruthy();
      });
    });
    describe('oauth', () => {
      it('get url', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const uri = await capsule.getOAuthURL(OAuthMethod.GOOGLE);

        const url = new URL(uri);

        expect(`${url.origin}/`).toEqual(getBaseUrl(capsule.ctx.env));
        expect(url.pathname).toEqual('/auth/google');
        expectSearchParams(url, {
          apiKey: API_KEY,
          sessionLookupId: SESSION_LOOKUP_ID,
        });
      });
      it('logs in user', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const { email, userExists } = await capsule.waitForOAuth();

        expect(userExists).toBeTruthy();
        expect(email).toEqual(USER_EMAIL);
        expect(capsule.getUserId()).toEqual(USER_ID);
        expect(capsule.getEmail()).toEqual(USER_EMAIL);
      });
    });
    describe('post login', () => {
      it('waitForLoginAndSetup - has wallet', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        await capsule.initiateUserLogin(USER_EMAIL);
        const resp = await capsule.waitForLoginAndSetup();

        const isFullyLoggedIn = await capsule.isFullyLoggedIn();

        expect(isFullyLoggedIn).toBeTruthy();
        expect(resp.needsWallet).toBeFalsy();
        expect(resp.isComplete).toBeTruthy();
        expect(capsule.getUserId()).toEqual(USER_ID);
        expect(capsule.getEmail()).toEqual(USER_EMAIL);
      });
      it('waitForLoginAndSetup - with pregen', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        mockGetPregenWallets.mockResolvedValue({ wallets: PREGEN_WALLETS_EMAIL });
        mockGetWallets.mockResolvedValue({ data: { wallets: [] } });
        mockGetTransmissionKeyshares.mockResolvedValue({ data: { temporaryShares: [] } });

        const pregenWallets = await capsule.createPregenWalletPerType(USER_EMAIL, PregenIdentifierType.EMAIL, [
          WalletType.EVM,
          WalletType.SOLANA,
        ]);

        const walletsToSet = {};

        pregenWallets.forEach(w => (walletsToSet[w.id] = w));

        await capsule.setWallets(walletsToSet);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        await capsule.initiateUserLogin(USER_EMAIL);
        const resp = await capsule.waitForLoginAndSetup();

        expect(resp.needsWallet).toBeFalsy();
        expect(resp.isComplete).toBeTruthy();
        expect(capsule.getUserId()).toEqual(USER_ID);
        expect(capsule.getEmail()).toEqual(USER_EMAIL);

        const wallets = capsule.wallets;

        expect(wallets[PREGEN_WALLET_EMAIL.id]).toBeDefined();
        expect(wallets[PREGEN_WALLET_EMAIL.id].pregenIdentifier).toBeUndefined();
        expect(wallets[SOLANA_PREGEN_WALLET_EMAIL.id]).toBeDefined();
        expect(wallets[SOLANA_PREGEN_WALLET_EMAIL.id].pregenIdentifier).toBeUndefined();
        expect(mockDistributeCapsuleShare).toBeCalled();

        mockGetPregenWallets.mockResolvedValue({ wallets: [] });
        mockGetWallets.mockResolvedValue({ data: { wallets: WALLETS } });
        mockGetTransmissionKeyshares.mockResolvedValue({
          data: {
            temporaryShares: SHARES,
          },
        });
      });

      it('exportSession', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        await capsule.initiateUserLogin(USER_EMAIL);
        await capsule.waitForLoginAndSetup();

        const session = await capsule.exportSession();

        expect(JSON.parse(Buffer.from(session, 'base64').toString())).toMatchObject({
          email: USER_EMAIL,
          userId: USER_ID,
        });
      });

      it('importSession', async () => {
        const session = Buffer.from(
          JSON.stringify({
            email: USER_EMAIL,
            userId: USER_ID,
            wallets: { [WALLET.id]: WALLET },
            currentWalletIds: { EVM: [WALLET.id] },
          }),
        ).toString('base64');

        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        await capsule.importSession(session);

        expect(capsule.getEmail()).toEqual(USER_EMAIL);
        expect(capsule.getUserId()).toEqual(USER_ID);
        expect(capsule.wallets).toEqual({ [WALLET.id]: WALLET });
        expect(capsule.currentWalletIds).toEqual({ EVM: [WALLET.id] });
      });

      it('keey session alive', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        let isAlive = await capsule.keepSessionAlive();

        expect(isAlive).toEqual(true);

        mockKeepSessionAlive.mockRejectedValueOnce('error');

        isAlive = await capsule.keepSessionAlive();

        expect(isAlive).toEqual(false);
      });
    });
  });
  describe('transaction review', () => {
    let capsule: MockCapsule;

    beforeAll(async () => {
      capsule = new MockCapsule(Environment.DEV, API_KEY);
    });

    it('getTransactionReviewUrl', async () => {
      await capsule.setUserId(USER_ID);
      await capsule.setEmail(USER_EMAIL);
      const transactionReviewRes: string = await (capsule as unknown as any).getTransactionReviewUrl(
        TRANSACTION_ID,
        TIMEOUT_MS,
      );

      const url = new URL(transactionReviewRes);
      expect(url.origin).toEqual(PARTNER.portalUrl);
      expect(url.pathname).toEqual(`/web/users/${USER_ID}/transaction-review/${TRANSACTION_ID}`);
      expectSearchParams(url, {
        apiKey: PARTNER.apiKey,
        email: USER_EMAIL,
        partnerId: PARTNER.id,
        portalAccentColor: PARTNER.accentColor,
        portalBackgroundColor: PARTNER.backgroundColor,
        portalFont: PARTNER.font,
        portalForegroundColor: PARTNER.foregroundColor,
        portalThemeMode: PARTNER.themeMode,
        timeoutMs: TIMEOUT_MS.toString(),
      });
    });
  });
  describe('on-ramp transactions', () => {
    let capsule: MockCapsule;

    beforeAll(async () => {
      capsule = new MockCapsule(Environment.DEV, API_KEY);
    });

    it('getOnRampTransactionUrl', async () => {
      await capsule.setUserId(USER_ID);
      await capsule.setCurrentWalletIds(CURRENT_WALLET_IDS);
      const transactionReviewRes: string = await (capsule as unknown as any).getOnRampTransactionUrl({
        purchaseId: PURCHASE_ID,
        walletId: WALLET.id,
      });

      const url = new URL(transactionReviewRes);
      expect(url.origin).toEqual(getPortalBaseURL(capsule.ctx));
      expect(url.pathname).toEqual(`/web/users/${USER_ID}/on-ramp-transaction/${PURCHASE_ID}`);
      expectSearchParams(url, {
        ...COMMON_SEARCH_PARAMS,
        apiKey: API_KEY,
        currentWalletIds: JSON.stringify(CURRENT_WALLET_IDS),
        sessionId: SESSION_ID,
        walletId: WALLET.id,
      });
    });

    it('initiateOnRampTransaction', async () => {
      await capsule.setUserId(USER_ID);
      await capsule.setWallets({ [WALLET.id]: WALLET } as unknown as any);
      const params = {
        type: OnRampPurchaseType.BUY,
        walletId: WALLET.id,
        walletType: WALLET.type,
        provider: OnRampProvider.STRIPE,
        fiat: 'USD',
        fiatQuantity: '100',
        defaultNetwork: Network.ETHEREUM,
        defaultAsset: OnRampAsset.ETHEREUM,
        networks: [Network.ETHEREUM, Network.BASE],
        assets: [OnRampAsset.ETHEREUM, OnRampAsset.USDC],
      };

      const { onRampPurchase, portalUrl } = await capsule.initiateOnRampTransaction({
        walletId: WALLET.id,
        shouldOpenPopup: true,
        params,
      });

      expect(mockCreateOnRampPurchase).toHaveBeenCalledWith({
        userId: USER_ID,
        params: {
          ...params,
          address: WALLET.address,
        },
        walletId: WALLET.id,
      });

      expect(new URL(portalUrl).origin).toEqual(getPortalBaseURL(capsule.ctx));
      expect(new URL(portalUrl).pathname).toEqual(`/web/users/${USER_ID}/on-ramp-transaction/${onRampPurchase.id}`);

      expect((capsule as unknown as any).platformUtils.openPopup).toHaveBeenCalledWith(portalUrl, {
        type: PopupType.ON_RAMP_TRANSACTION,
      });

      expect(onRampPurchase).toEqual({ id: 'id', userId: USER_ID, address: WALLET.address, ...params });
    });
  });
  describe('wallets', { timeout: 25000 }, () => {
    describe('new user', () => {
      describe('email', () => {
        let capsule: MockCapsule;

        beforeAll(async () => {
          capsule = new MockCapsule(Environment.DEV, API_KEY);
        });

        it('waitForPasskeyAndCreateWallet - no pregen', async () => {
          await capsule.createUser(USER_EMAIL);

          const created = await capsule.waitForPasskeyAndCreateWallet();
          await capsule.setCurrentWalletIds(created.walletIds);

          expect(created.walletIds.EVM).toEqual([WALLET.id]);
          expect(created.walletIds.SOLANA).toEqual([SOLANA_WALLET.id]);
          expect(created.walletIds.COSMOS).toBeUndefined();
          expect(mockDistributeCapsuleShare).toBeCalled();
        });
        it('waitForPasskeyAndCreateWallet - pregen', async () => {
          mockGetPregenWallets.mockResolvedValue({ wallets: PREGEN_WALLETS_EMAIL });

          const pregenWallets = await capsule.createPregenWalletPerType(USER_EMAIL, PregenIdentifierType.EMAIL, [
            WalletType.EVM,
            WalletType.SOLANA,
          ]);

          const walletsToSet = {};

          pregenWallets.forEach(w => (walletsToSet[w.id] = w));

          await capsule.setWallets(walletsToSet);

          await capsule.createUser(USER_EMAIL);

          const created = await capsule.waitForPasskeyAndCreateWallet();
          await capsule.setCurrentWalletIds(created.walletIds);

          expect(pregenWallets.length).toBe(2);
          expect(created.walletIds.EVM).toEqual([PREGEN_WALLET_EMAIL.id]);
          expect(created.walletIds.SOLANA).toEqual([SOLANA_PREGEN_WALLET_EMAIL.id]);
          expect(created.walletIds.COSMOS).toBeUndefined();

          mockGetPregenWallets.mockResolvedValue({ wallets: [] });
          expect(mockDistributeCapsuleShare).toBeCalled();
        });
      });
      describe('phone', () => {
        let capsule: MockCapsule;

        beforeAll(async () => {
          capsule = new MockCapsule(Environment.DEV, API_KEY);
        });

        it('waitForPasskeyAndCreateWallet - no pregen', async () => {
          await capsule.createUserByPhone(USER_PHONE, USER_COUNTRY_CODE as CountryCallingCode);

          const created = await capsule.waitForPasskeyAndCreateWallet();
          await capsule.setCurrentWalletIds(created.walletIds);

          expect(created.walletIds.EVM).toEqual([WALLET.id]);
          expect(created.walletIds.SOLANA).toEqual([SOLANA_WALLET.id]);
          expect(created.walletIds.COSMOS).toBeUndefined();
          expect(mockDistributeCapsuleShare).toBeCalled();
        });
        it('waitForPasskeyAndCreateWallet - pregen', async () => {
          mockGetPregenWallets.mockResolvedValue({ wallets: PREGEN_WALLETS_PHONE });
          mockPreKeygen.mockResolvedValueOnce(PREGEN_WALLET_PHONE_KEYGEN_RES);

          const pregenWallets = await capsule.createPregenWalletPerType(
            `${USER_COUNTRY_CODE}${USER_PHONE}`,
            PregenIdentifierType.PHONE,
            [WalletType.EVM],
          );

          const walletsToSet = {};

          pregenWallets.forEach(w => (walletsToSet[w.id] = w));

          await capsule.setWallets(walletsToSet);

          await capsule.createUserByPhone(USER_PHONE, USER_COUNTRY_CODE as CountryCallingCode);

          const created = await capsule.waitForPasskeyAndCreateWallet();
          await capsule.setCurrentWalletIds(created.walletIds);

          expect(pregenWallets.length).toBe(1);
          expect(created.walletIds.EVM).toEqual([PREGEN_WALLET_PHONE.id]);
          expect(created.walletIds.SOLANA).toEqual([SOLANA_WALLET.id]);
          expect(created.walletIds.COSMOS).toBeUndefined();

          mockGetPregenWallets.mockResolvedValue({ wallets: [] });
          expect(mockDistributeCapsuleShare).toBeCalled();
        });
      });
    });
    describe('transacting', () => {
      let capsule: MockCapsule;

      beforeAll(async () => {
        capsule = new MockCapsule(Environment.DEV, API_KEY);

        await capsule.createUser(USER_EMAIL);

        const created = await capsule.waitForPasskeyAndCreateWallet();
        await capsule.setCurrentWalletIds(created.walletIds);

        await capsule.setUserId(USER_ID);
      });

      it('signMessageInner', async () => {
        let res = await (capsule as unknown as any).signMessageInner(
          capsule.wallets[WALLET.id],
          USER_ID,
          'message',
          'cosmosSignDoc',
        );

        expect((capsule as unknown as any).platformUtils.signMessage).toHaveBeenCalledWith(
          capsule.ctx,
          USER_ID,
          WALLET.id,
          'test-wallet-signer',
          'message',
          'session-cookie',
          true,
          'cosmosSignDoc',
        );

        expect(res).toEqual({ signature: 'signature' });

        await capsule.setWallets({ [SOLANA_WALLET.id]: { ...SOLANA_WALLET, signer: 'signer' } } as unknown as Record<
          string,
          Wallet
        >);
        await capsule.setCurrentWalletIds({ SOLANA: [SOLANA_WALLET.id] });

        res = await (capsule as unknown as any).signMessageInner(capsule.wallets[SOLANA_WALLET.id], USER_ID, 'message');

        expect((capsule as unknown as any).platformUtils.ed25519Sign).toHaveBeenCalledWith(
          capsule.ctx,
          USER_ID,
          SOLANA_WALLET.id,
          'signer',
          'message',
          'session-cookie',
        );

        expect(res).toEqual({ signature: 'signature' });
      });

      it('signTransaction', async () => {
        await capsule.setWallets({ [WALLET.id]: { ...WALLET, signer: 'signer' } } as unknown as Record<string, Wallet>);
        await capsule.setCurrentWalletIds({ EVM: [WALLET.id] });

        let res = await capsule.signTransaction(WALLET.id, 'tx', '1');

        expect((capsule as unknown as any).platformUtils.signTransaction).toHaveBeenCalledWith(
          capsule.ctx,
          USER_ID,
          WALLET.id,
          'signer',
          'tx',
          '1',
          'session-cookie',
          true,
        );

        expect((res as SuccessfulSignatureRes).signature).toEqual('signature');

        (capsule as unknown as any).platformUtils.signTransaction.mockReturnValueOnce({
          pendingTransactionId: 'pending-transaction-id',
        });

        expect(capsule.signTransaction(WALLET.id, 'tx', '1')).rejects.toThrowError();

        // expect((res as DeniedSignatureRes).pendingTransactionId).toEqual('pending-transaction-id');

        // expect((capsule as unknown as any).platformUtils.openPopup).toHaveBeenCalledWith('pending-transaction-id', {
        //   type: PopupType.SIGN_TRANSACTION_REVIEW,
        // });
      });

      it('sendTransaction', async () => {
        await capsule.setWallets({ [WALLET.id]: { ...WALLET, signer: 'signer' } } as unknown as Record<string, Wallet>);
        await capsule.setCurrentWalletIds({ EVM: [WALLET.id] });

        let res = await capsule.sendTransaction(WALLET.id, 'tx', '1');

        expect((capsule as unknown as any).platformUtils.sendTransaction).toHaveBeenCalledWith(
          capsule.ctx,
          USER_ID,
          WALLET.id,
          'signer',
          'tx',
          '1',
          'session-cookie',
          true,
        );

        expect((res as SuccessfulSignatureRes).signature).toEqual('signature');

        (capsule as unknown as any).platformUtils.sendTransaction.mockReturnValueOnce({
          pendingTransactionId: 'pending-transaction-id',
        });

        expect(capsule.sendTransaction(WALLET.id, 'tx', '1')).rejects.toThrowError();
      });
    });

    describe('share', () => {
      let capsule: MockCapsule;
      beforeAll(async () => {
        capsule = new MockCapsule(Environment.DEV, API_KEY);

        await capsule.createUser(USER_EMAIL);

        const created = await capsule.waitForPasskeyAndCreateWallet();
        await capsule.setCurrentWalletIds(created.walletIds);

        await capsule.setUserId(USER_ID);
      });

      it('refresh share', async () => {
        vi.mocked(shareDistribution.distributeNewShare).mockResolvedValueOnce('recoveryShare');
        const { signer, protocolId, recoverySecret } = await capsule.refreshShare({
          walletId: WALLET.id,
          share: 'share',
          oldPartnerId: 'oldPartnerId',
          newPartnerId: 'newPartnerId',
          keyShareProtocolId: 'protocolId',
          redistributeBackupEncryptedShares: true,
          emailProps: { homepageUrl: 'homepageUrl' },
        });

        expect((capsule as unknown as any).platformUtils.refresh).toHaveBeenCalledWith(
          capsule.ctx,
          'session-cookie',
          USER_ID,
          WALLET.id,
          'share',
          'oldPartnerId',
          'newPartnerId',
          'protocolId',
        );

        expect(shareDistribution.distributeNewShare).toHaveBeenCalledWith(
          capsule.ctx,
          USER_ID,
          WALLET.id,
          signer,
          false,
          (capsule as unknown as any).getBackupKitEmailProps(),
          'newPartnerId',
          protocolId,
        );
        expect(signer).toEqual('test-refresh-signer');
        expect(protocolId).toEqual('protocolId');
        expect(recoverySecret).toEqual('recoveryShare');
      });
    });
    describe('helpers and utils', () => {
      let capsule: MockCapsule;

      beforeAll(async () => {
        capsule = new MockCapsule(Environment.DEV, API_KEY);

        await capsule.createUser(USER_EMAIL);

        const created = await capsule.waitForPasskeyAndCreateWallet();
        await capsule.setCurrentWalletIds(created.walletIds);
      });

      it('current wallets', async () => {
        const currentWalletIds = capsule.currentWalletIdsArray;
        expect(currentWalletIds[0][0]).toEqual(WALLET.id);
        expect(currentWalletIds[0][1]).toEqual(WalletType.EVM);
        expect(currentWalletIds[1][0]).toEqual(SOLANA_WALLET.id);
        expect(currentWalletIds[1][1]).toEqual(WalletType.SOLANA);

        const availableWallets = capsule.availableWallets;
        expect(availableWallets.length).toEqual(2);
        expect(availableWallets[0].id).toEqual(WALLET.id);
        expect(availableWallets[1].id).toEqual(SOLANA_WALLET.id);

        const wallets = capsule.getWallets();
        expect(wallets[WALLET.id]).toBeDefined();
        expect(wallets[SOLANA_WALLET.id]).toBeDefined();

        const walletsByType = capsule.getWalletsByType(WalletType.EVM);
        expect(walletsByType.length).toEqual(1);
        expect(walletsByType[0]).toBeDefined();
        expect(walletsByType[0].id).toEqual(WALLET.id);
      });
      it('find wallets by id', async () => {
        const wallet = capsule.findWallet(SOLANA_WALLET.id);
        expect(wallet).toBeDefined();
        expect(wallet?.id).toEqual(SOLANA_WALLET.id);

        const walletNoId = capsule.findWallet();
        expect(walletNoId).toBeDefined();
        expect(walletNoId?.id).toEqual(WALLET.id);

        const invalidWallet = capsule.findWallet('notAnId');
        expect(invalidWallet).toBeUndefined();

        const invalidWalletWithFilters = capsule.findWallet(SOLANA_WALLET.id, undefined, { type: [WalletType.EVM] });
        expect(invalidWalletWithFilters).toBeUndefined();

        const walletWithTypeOverride = capsule.findWallet(SOLANA_WALLET.id, WalletType.EVM);
        expect(walletWithTypeOverride).toBeDefined();
        expect(walletWithTypeOverride?.type).toEqual(WalletType.EVM);
      });
      it('find wallets by address', async () => {
        const wallet = capsule.findWalletByAddress(SOLANA_WALLET.address);
        expect(wallet).toBeDefined();
        expect(wallet.id).toEqual(SOLANA_WALLET.id);

        expect(() => capsule.findWalletByAddress('notAnAddress')).toThrowError('wallet with address notAnAddress not found');
        expect(() => capsule.findWalletByAddress(SOLANA_WALLET.address, { type: [WalletType.EVM] })).toThrowError(
          `wallet with id ${SOLANA_WALLET.id} and type ${SOLANA_WALLET.type} cannot be selected`,
        );
      });
      it('random wallet utils', async () => {
        const isMultiWallet = capsule.isMultiWallet;
        expect(isMultiWallet).toBeTruthy();

        const walletAddress = capsule.getAddress(SOLANA_WALLET.id);
        expect(walletAddress).toEqual(SOLANA_WALLET.address);

        const privateKey = await capsule.getPrivateKey(WALLET.id);
        expect(privateKey).toEqual('getPrivateKey');

        const privateKeyNoId = await capsule.getPrivateKey();
        expect(privateKeyNoId).toEqual('getPrivateKey');

        await expect(capsule.getPrivateKey(SOLANA_WALLET.id)).rejects.toThrowError('invalid wallet scheme');
      });
      it('pregen utils', async () => {
        capsule.wallets[WALLET.id] = {
          ...capsule.wallets[WALLET.id],
          isPregen: true,
          pregenIdentifierType: 'EMAIL',
          pregenIdentifier: USER_EMAIL,
        };

        await capsule.updateWalletIdentifierPreGen('test email', WALLET.id, PregenIdentifierType.EMAIL);
        expect(mockUpdatePregenWallet).toBeCalledWith(WALLET.id, {
          pregenIdentifier: 'test email',
          pregenIdentifierType: PregenIdentifierType.EMAIL,
        });
        expect(capsule.wallets[WALLET.id].pregenIdentifier).toEqual('test email');
        expect(capsule.wallets[WALLET.id].pregenIdentifierType).toEqual(PregenIdentifierType.EMAIL);

        const hasPregenFalsy = await capsule.hasPregenWallet(USER_EMAIL, PregenIdentifierType.EMAIL);
        expect(mockGetPregenWallets).toBeCalledWith({ EMAIL: [USER_EMAIL] }, false, capsule.getUserId());
        expect(hasPregenFalsy).toBeFalsy();

        const pregenNoWallets = await capsule.getPregenWallets(USER_EMAIL, PregenIdentifierType.EMAIL);
        expect(mockGetPregenWallets).toBeCalledWith({ EMAIL: [USER_EMAIL] }, false, capsule.getUserId());
        expect(pregenNoWallets.length).toEqual(0);

        mockGetPregenWallets.mockResolvedValue({ wallets: PREGEN_WALLETS_EMAIL });
        const hasPregen = await capsule.hasPregenWallet(USER_EMAIL, PregenIdentifierType.EMAIL);
        expect(mockGetPregenWallets).toBeCalledWith({ EMAIL: [USER_EMAIL] }, false, capsule.getUserId());
        expect(hasPregen).toBeTruthy();

        const pregenWallets = await capsule.getPregenWallets(USER_EMAIL, PregenIdentifierType.EMAIL);
        expect(mockGetPregenWallets).toBeCalledWith({ EMAIL: [USER_EMAIL] }, false, capsule.getUserId());
        expect(pregenWallets.length).toEqual(2);

        const encodedWallets = Object.values(capsule.wallets)
          .map(wallet => Buffer.from(JSON.stringify(wallet)).toString('base64'))
          .join('-');
        const userShare = capsule.getUserShare();
        expect(userShare).toEqual(encodedWallets);

        // Reset wallets to test setting user share
        await capsule.setWallets({});
        expect(Object.keys(capsule.wallets).length).toEqual(0);
        await capsule.setUserShare(userShare);
        expect(Object.keys(capsule.wallets).length).toEqual(2);
        expect(capsule.wallets[WALLET.id]).toBeDefined;
        expect(capsule.wallets[SOLANA_WALLET.id]).toBeDefined;
      });
      it('supported auth methods', async () => {
        const supportedAuthMethods = await capsule.getSupportedCreateAuthMethods();

        expect(mockTouchSession).toHaveBeenCalled();

        expect(supportedAuthMethods).toEqual(new Set([AuthMethod.PASSKEY, AuthMethod.PASSWORD]));
      });
    });
  });
  describe('loops', () => {
    let capsule: MockCapsule;

    beforeAll(async () => {
      capsule = new MockCapsule(Environment.DEV, API_KEY);
    });

    it('exitAccountCreation', () => {
      (capsule as unknown as any).isAwaitingAccountCreation = true;

      expect((capsule as unknown as any).isAwaitingAccountCreation).toBeTruthy();

      capsule.exitAccountCreation();

      expect((capsule as unknown as any).isAwaitingAccountCreation).toBeFalsy();
    });

    it('exitLogin', () => {
      (capsule as unknown as any).isAwaitingLogin = true;

      expect((capsule as unknown as any).isAwaitingLogin).toBeTruthy();

      capsule.exitLogin();

      expect((capsule as unknown as any).isAwaitingLogin).toBeFalsy();
    });

    it('exitFarcaster', () => {
      (capsule as unknown as any).isAwaitingFarcaster = true;

      expect((capsule as unknown as any).isAwaitingFarcaster).toBeTruthy();

      capsule.exitFarcaster();

      expect((capsule as unknown as any).isAwaitingFarcaster).toBeFalsy();
    });

    it('exitOAuth', () => {
      (capsule as unknown as any).isAwaitingOAuth = true;

      expect((capsule as unknown as any).isAwaitingOAuth).toBeTruthy();

      capsule.exitOAuth();

      expect((capsule as unknown as any).isAwaitingOAuth).toBeFalsy();
    });

    it('exitLoops', () => {
      (capsule as unknown as any).isAwaitingLogin = true;
      (capsule as unknown as any).isAwaitingAccountCreation = true;
      (capsule as unknown as any).isAwaitingFarcaster = true;
      (capsule as unknown as any).isAwaitingOAuth = true;

      capsule.exitLoops();

      expect((capsule as unknown as any).isAwaitingLogin).toBeFalsy();
      expect((capsule as unknown as any).isAwaitingAccountCreation).toBeFalsy();
      expect((capsule as unknown as any).isAwaitingFarcaster).toBeFalsy();
      expect((capsule as unknown as any).isAwaitingOAuth).toBeFalsy();
    });
  });
  describe('2FA', () => {
    let capsule: MockCapsule;

    beforeAll(async () => {
      capsule = new MockCapsule(Environment.DEV, API_KEY);

      await capsule.setUserId(USER_ID);
    });
    describe('check, setup & enable', () => {
      it('check - pass', async () => {
        const { isSetup } = await capsule.check2FAStatus();

        expect(isSetup).toBeTruthy();
      });
      it('check - fail no user id', async () => {
        await capsule.logout();

        const { isSetup } = await capsule.check2FAStatus();

        await capsule.setUserId(USER_ID);

        expect(isSetup).toBeFalsy();
      });
      it('check - fail api', async () => {
        mockCheck2FAStatus.mockResolvedValueOnce({ data: { isSetup: false } });

        const { isSetup } = await capsule.check2FAStatus();

        expect(isSetup).toBeFalsy();
      });
      it('setup', async () => {
        const { uri } = await capsule.setup2FA();

        expect(uri).toEqual(TWOFA_URI);
      });
      it('enable - pass', async () => {
        await expect(capsule.enable2FA('123456')).resolves.not.toThrowError();
      });
      it('enable - pass', async () => {
        mockEnable2FA.mockRejectedValueOnce('invalid');
        await expect(capsule.enable2FA('123456')).rejects.toThrowError();
      });
    });
    describe('verify', () => {
      it('email', async () => {
        const resp = await capsule.verify2FA(USER_EMAIL, '123456');

        expect(resp).toEqual(TWOFA_VERIFY_RESP);
      });
      it('email - fail', async () => {
        mockVerify2FA.mockRejectedValueOnce('invalid');
        await expect(capsule.verify2FA(USER_EMAIL, '123456')).rejects.toThrowError();
      });
      it('phone', async () => {
        const resp = await capsule.verify2FAForPhone(USER_PHONE, USER_COUNTRY_CODE as CountryCallingCode, '123456');

        expect(resp).toEqual(TWOFA_VERIFY_RESP);
      });
      it('email - fail', async () => {
        mockVerify2FAForPhone.mockRejectedValueOnce('invalid');
        await expect(
          capsule.verify2FAForPhone(USER_PHONE, USER_COUNTRY_CODE as CountryCallingCode, '123456'),
        ).rejects.toThrowError();
      });
    });
  });
});
