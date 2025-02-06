/// <reference lib="dom" />
import { describe, vi, afterEach, expect, it, beforeAll } from 'vitest';

import ParaCore, {
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
  SOLANA_PREGEN_WALLET_PHONE,
} from '../constants';
import { MockPara } from '../mocks/mockParaCore.js';
import {
  mockAddSessionPublicKey,
  mockCheck2FAStatus,
  mockCheckUserExists,
  mockCreateOnRampPurchase,
  mockCreateUser,
  mockDistributeParaShare,
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
} from '@getpara/user-management-client';
import { PregenIdentifierType, Wallet } from '../../src/ParaCore.js';
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

describe('ParaCore', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('creates a new instance of ParaCore with correct fields', () => {
      const para = new MockPara(Environment.DEV, API_KEY);

      expect(para).toBeInstanceOf(ParaCore);
      expect(para.ctx.env).toBe(Environment.DEV);
      expect(para.ctx.apiKey).toBe(API_KEY);
      expect(para.wallets).toEqual({});
      expect(para.externalWallets).toEqual({});
      expect(para.currentExternalWalletAddresses).toBeUndefined();

      // casting as any to access protected fields
      expect((para as any).supportedWalletTypes).toEqual([]);
    });

    it('supportedWalletTypes option', () => {
      let para = new MockPara(Environment.DEV, API_KEY, {
        supportedWalletTypes: { [WalletType.EVM]: { optional: true } },
      });

      expect(para.supportedWalletTypes).toEqual([]);

      para = new MockPara(Environment.DEV, API_KEY, {
        supportedWalletTypes: { ['FOO' as unknown as WalletType]: true },
      });

      expect(para.supportedWalletTypes).toEqual([]);

      para = new MockPara(Environment.DEV, API_KEY, {
        supportedWalletTypes: { [WalletType.EVM]: true, [WalletType.COSMOS]: { optional: true, prefix: 'celestia' } },
      });

      expect(para.supportedWalletTypes).toEqual([
        { type: WalletType.EVM, optional: false },
        { type: WalletType.COSMOS, optional: true },
      ]);

      expect(para.cosmosPrefix).toEqual('celestia');

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
      let para = new MockPara(Environment.DEV, API_KEY, opts);

      expect(para).toBeDefined();
      expect((para as unknown as any).localStorageGetItem).toEqual(opts.localStorageGetItemOverride);
      expect((para as unknown as any).localStorageSetItem).toEqual(opts.localStorageSetItemOverride);
      expect((para as unknown as any).sessionStorageGetItem).toEqual(opts.sessionStorageGetItemOverride);
      expect((para as unknown as any).sessionStorageSetItem).toEqual(opts.sessionStorageSetItemOverride);
      expect((para as unknown as any).clearStorage).toEqual(opts.clearStorageOverride);
    });
  });
  describe('external wallets', () => {
    it('logs in successfully', async () => {
      const para = new MockPara(Environment.DEV, API_KEY);

      const { address, type, provider } = EXTERNAL_WALLET;

      await para.externalWalletLogin({ address, type, provider });

      const isFullyLoggedIn = await para.isFullyLoggedIn();
      const isSessionActive = await para.isSessionActive();

      expect(para.externalWallets).toEqual({
        [address]: STORED_EXTERNAL_WALLET,
      });
      expect(para.currentExternalWalletAddresses).toEqual([address]);
      expect((para as unknown as any).isUsingExternalWallet()).toBeTruthy();
      expect(isFullyLoggedIn).toBeTruthy();
      expect(isSessionActive).toBeTruthy();
    });
    it('log in fails', async () => {
      const para = new MockPara(Environment.DEV, API_KEY);

      const { address, type, provider } = EXTERNAL_WALLET;

      mockExternalWalletLogin.mockRejectedValueOnce(LOGIN_ERROR);

      await expect(para.externalWalletLogin({ address, type, provider })).rejects.toThrowError(LOGIN_ERROR);

      expect(para.externalWallets).toEqual({});
      expect(para.currentExternalWalletAddresses).toBeUndefined();
    });
    it('logs out and clears external wallets', async () => {
      const para = new MockPara(Environment.DEV, API_KEY);

      const { address, type, provider } = EXTERNAL_WALLET;

      await para.externalWalletLogin({ address, type, provider });

      expect(para.externalWallets).toEqual({
        [address]: STORED_EXTERNAL_WALLET,
      });
      expect(para.currentExternalWalletAddresses).toEqual([address]);

      await para.logout();

      expect(para.externalWallets).toEqual({});
      expect(para.currentExternalWalletAddresses).toBeUndefined();
    });
    it('util functions', async () => {
      const para = new MockPara(Environment.DEV, API_KEY);

      const { address, type, provider } = EXTERNAL_WALLET;

      await para.externalWalletLogin({ address, type, provider });

      expect(para.externalWallets).toEqual({
        [address]: STORED_EXTERNAL_WALLET,
      });
      expect(para.currentExternalWalletAddresses).toEqual([address]);

      const displayAddress = para.getDisplayAddress(address);
      expect(displayAddress).toEqual(address);

      const identiconHash = para.getIdenticonHash(address);
      expect(identiconHash).toEqual(`${address}-${address}-${type}`);

      const foundWalletByAddress = para.findWalletByAddress(address);
      expect(foundWalletByAddress).toEqual(STORED_EXTERNAL_WALLET);

      const foundWallet = para.findWallet(address);
      expect(foundWallet).toEqual(STORED_EXTERNAL_WALLET);

      const foundWalletNoAddress = para.findWallet();
      expect(foundWalletNoAddress).toEqual(STORED_EXTERNAL_WALLET);
    });
  });
  describe('create user', () => {
    describe('email', () => {
      it('creates a new user', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const userExists = await para.checkIfUserExists({ email: USER_EMAIL });

        expect(mockCheckUserExists).toBeCalledWith({ email: USER_EMAIL });
        expect(userExists).toBeTruthy();

        await para.createUser({ email: USER_EMAIL });

        expect(mockCreateUser).toBeCalledWith({
          email: USER_EMAIL,
        });

        expect(para.getEmail()).toEqual(USER_EMAIL);
        expect(para.getUserId()).toEqual(USER_ID);
      });
      it("user doesn't exists", async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        mockCheckUserExists.mockResolvedValueOnce({ data: { exists: false } });

        const userExists = await para.checkIfUserExists({ email: USER_EMAIL });

        expect(mockCheckUserExists).toBeCalledWith({ email: USER_EMAIL });
        expect(userExists).toBeFalsy();
      });
      it('verify', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        await para.createUser({ email: USER_EMAIL });

        const verifyRes = await para.verifyEmail({ verificationCode: VERIFICATION_CODE });

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
        const para = new MockPara(Environment.DEV, API_KEY);

        await para.createUser({ email: USER_EMAIL });

        expect(para.getEmail()).toEqual(USER_EMAIL);
        expect(para.getUserId()).toEqual(USER_ID);

        await para.logout();

        expect(para.getEmail()).toBeUndefined();
        expect(para.getUserId()).toBeUndefined();
      });
      it('logs out and preserves pregen wallets', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const pregenWallets = { [PREGEN_WALLETS_EMAIL[0].id]: { ...PREGEN_WALLETS_EMAIL[0] } };
        const userWallets = { [WALLET.id]: { ...WALLET } };

        await para.setWallets({ ...userWallets, ...pregenWallets } as unknown as Record<string, Wallet>);

        await para.logout();

        expect(para.wallets).toEqual(pregenWallets);
      });
      it('logs out and clears pregen wallets', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const pregenWallets = { [PREGEN_WALLETS_EMAIL[0].id]: { ...PREGEN_WALLETS_EMAIL[0] } };
        const userWallets = { [WALLET.id]: { ...WALLET } };

        await para.setWallets({ ...userWallets, ...pregenWallets } as unknown as Record<string, Wallet>);

        await para.logout({ clearPregenWallets: true });

        expect(para.wallets).toEqual({});
      });
      it('logs out and clears pregen wallets', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const pregenWallets = { [PREGEN_WALLETS_EMAIL[0].id]: { ...PREGEN_WALLETS_EMAIL[0] } };
        const userWallets = { [WALLET.id]: { ...WALLET } };

        await para.setWallets({ ...userWallets, ...pregenWallets } as unknown as Record<string, Wallet>);

        await para.logout({ clearPregenWallets: true });

        expect(para.wallets).toEqual({});
      });
    });
    describe('phone', () => {
      it('creates a new user', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const userExists = await para.checkIfUserExistsByPhone({
          phone: USER_PHONE,
          countryCode: USER_COUNTRY_CODE,
        });

        expect(mockCheckUserExists).toBeCalledWith({ phone: USER_PHONE, countryCode: USER_COUNTRY_CODE });
        expect(userExists).toBeTruthy();

        await para.createUserByPhone({ phone: USER_PHONE, countryCode: USER_COUNTRY_CODE as CountryCallingCode });

        expect(mockCreateUser).toBeCalledWith({
          phone: USER_PHONE,
          countryCode: USER_COUNTRY_CODE,
        });

        expect(para.getPhone()).toEqual({
          phone: USER_PHONE,
          countryCode: USER_COUNTRY_CODE,
        });
        expect(para.getPhoneNumber()).toEqual(`+${USER_COUNTRY_CODE}${USER_PHONE}`);
        expect(para.getUserId()).toEqual(USER_ID);
      });

      it("user doesn't", async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        mockCheckUserExists.mockResolvedValueOnce({ data: { exists: false } });

        const userExists = await para.checkIfUserExistsByPhone({ phone: USER_PHONE, countryCode: USER_COUNTRY_CODE });

        expect(mockCheckUserExists).toBeCalledWith({ phone: USER_PHONE, countryCode: USER_COUNTRY_CODE });
        expect(userExists).toBeFalsy();
      });
      it('verify', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        await para.createUserByPhone({ phone: USER_PHONE, countryCode: USER_COUNTRY_CODE as CountryCallingCode });

        const verifyRes = await para.verifyPhone({ verificationCode: VERIFICATION_CODE });

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
        const para = new MockPara(Environment.DEV, API_KEY);

        await para.createUserByPhone({ phone: USER_PHONE, countryCode: USER_COUNTRY_CODE as CountryCallingCode });

        expect(para.getPhone()).toEqual({
          phone: USER_PHONE,
          countryCode: USER_COUNTRY_CODE,
        });
        expect(para.getPhoneNumber()).toEqual(`+${USER_COUNTRY_CODE}${USER_PHONE}`);
        expect(para.getUserId()).toEqual(USER_ID);

        await para.logout();

        expect(para.getPhone()).toEqual({
          phone: undefined,
          countryCode: undefined,
        });
        expect(para.getPhoneNumber()).toBeUndefined();
        expect(para.getUserId()).toBeUndefined();
      });
    });
  });
  describe('login', { timeout: 25000 }, () => {
    describe('email', () => {
      it('initiates login', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginRes = await para.initiateUserLogin({ email: USER_EMAIL });
        const isEmail = await para.isEmail;

        const url = new URL(loginRes);

        expect(isEmail).toBeTruthy();
        expect(url.origin).toEqual(PARTNER.portalUrl);
        expect(url.pathname).toEqual('/web/biometrics/login');
        expectSearchParams(url, {
          ...COMMON_SEARCH_PARAMS,
          apiKey: PARTNER.apiKey,
          email: USER_EMAIL,
          encryptionKey: getPublicKeyHex(para.loginEncryptionKeyPair!),
          sessionId: SESSION_ID,
          pregenIds: '{}',
        });
      });
      it('initiates login - short url', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginLink = await para.initiateUserLogin({ email: USER_EMAIL, useShortUrl: true });

        const url = new URL(loginLink);
        expect(url.origin).toEqual('http://localhost:3003');
        expect(url.pathname).toContain(`/short/${TEMP_TRANSMISSION_INIT_ID}`);
      });
      it('initiates loginV2', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginRes = await para.initiateUserLoginV2({ email: USER_EMAIL });

        expect(loginRes.has(AuthMethod.PASSKEY)).toBeTruthy();
        expect(loginRes.has(AuthMethod.PASSWORD)).toBeTruthy();
      });
    });
    describe('phone', () => {
      it('initiates login', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginRes = await para.initiateUserLogin({ phone: USER_PHONE, countryCode: USER_COUNTRY_CODE });

        const isPhone = await para.isPhone;

        const url = new URL(loginRes);

        expect(isPhone).toBeTruthy();
        expect(url.origin).toEqual(PARTNER.portalUrl);
        expect(url.pathname).toEqual('/web/biometrics/login');
        expectSearchParams(url, {
          ...COMMON_SEARCH_PARAMS,
          apiKey: PARTNER.apiKey,
          countryCode: USER_COUNTRY_CODE,
          encryptionKey: getPublicKeyHex(para.loginEncryptionKeyPair!),
          phone: USER_PHONE,
          sessionId: SESSION_ID,
          pregenIds: '{}',
        });
      });
      it('initiates login - phone only method', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginRes = await para.initiateUserLoginForPhone({ phone: USER_PHONE, countryCode: USER_COUNTRY_CODE });

        const url = new URL(loginRes);

        expect(url.origin).toEqual(PARTNER.portalUrl);
        expect(url.pathname).toEqual('/web/biometrics/login');
        expectSearchParams(url, {
          ...COMMON_SEARCH_PARAMS,
          apiKey: PARTNER.apiKey,
          countryCode: USER_COUNTRY_CODE,
          encryptionKey: getPublicKeyHex(para.loginEncryptionKeyPair!),
          phone: USER_PHONE,
          sessionId: SESSION_ID,
          pregenIds: '{}',
        });
      });
      it('initiates loginV2', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginRes = await para.initiateUserLoginV2({ phone: USER_PHONE, countryCode: USER_COUNTRY_CODE });

        expect(loginRes.has(AuthMethod.PASSKEY)).toBeTruthy();
        expect(loginRes.has(AuthMethod.PASSWORD)).toBeTruthy();
      });
    });
    describe('farcaster', () => {
      it('get connect url', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const uri = await para.getFarcasterConnectURL();

        expect(uri).toEqual(FARCASTER_CONNECT_URI);
      });
      it('logs in user', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const { userExists, username } = await para.waitForFarcasterStatus();

        const farcasterUsername = await para.getFarcasterUsername();
        const isFarcaster = await para.isFarcaster;

        expect(userExists).toBeTruthy();
        expect(username).toEqual(USER_FARCASTER_USERNAME);
        expect(farcasterUsername).toEqual(USER_FARCASTER_USERNAME);
        expect(isFarcaster).toBeTruthy();
        expect(para.getUserId()).toEqual(USER_ID);
      });
      it('wait for login fails', async () => {
        mockGetFarcasterAuthStatus.mockRejectedValueOnce(LOGIN_ERROR);

        const para = new MockPara(Environment.DEV, API_KEY);

        const waitResp = await para.waitForFarcasterStatus();

        await expect(waitResp).toBeUndefined();
      });
      it('initiates loginV2', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginRes = await para.initiateUserLoginV2({ farcasterUsername: USER_FARCASTER_USERNAME });

        expect(loginRes.has(AuthMethod.PASSKEY)).toBeTruthy();
        expect(loginRes.has(AuthMethod.PASSWORD)).toBeTruthy();
      });
    });
    describe('telegram', () => {
      it('logs in user', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const { isValid, telegramUserId, userId } = (await para.verifyTelegram(USER_TELEGRAM_AUTH_OBJECT)) as unknown as any;

        expect(isValid).toEqual(true);
        expect(telegramUserId).toEqual(USER_TELEGRAM_AUTH_OBJECT.id.toString());
        expect(userId).toEqual(USER_ID);

        expect(para.isTelegram).toBeTruthy();
        expect(para.telegramUserId).toEqual(USER_TELEGRAM_AUTH_OBJECT.id.toString());
        expect(para.getUserId()).toEqual(USER_ID);
      });
      it('initiates loginV2', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginRes = await para.initiateUserLoginV2({ telegramUserId: USER_TELEGRAM_AUTH_OBJECT.id.toString() });

        expect(loginRes.has(AuthMethod.PASSKEY)).toBeTruthy();
        expect(loginRes.has(AuthMethod.PASSWORD)).toBeTruthy();
      });
    });
    describe('oauth', () => {
      it('get url', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const uri = await para.getOAuthURL({ method: OAuthMethod.GOOGLE });

        const url = new URL(uri);

        expect(`${url.origin}/`).toEqual(getBaseUrl(para.ctx.env));
        expect(url.pathname).toEqual('/auth/google');
        expectSearchParams(url, {
          apiKey: API_KEY,
          sessionLookupId: SESSION_LOOKUP_ID,
        });
      });
      it('logs in user', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const { email, userExists } = await para.waitForOAuth();

        expect(userExists).toBeTruthy();
        expect(email).toEqual(USER_EMAIL);
        expect(para.getUserId()).toEqual(USER_ID);
        expect(para.getEmail()).toEqual(USER_EMAIL);
      });
    });
    describe('post login', () => {
      it('waitForLoginAndSetup - has wallet', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        await para.initiateUserLogin({ email: USER_EMAIL });
        const resp = await para.waitForLoginAndSetup();

        const isFullyLoggedIn = await para.isFullyLoggedIn();

        expect(isFullyLoggedIn).toBeTruthy();
        expect(resp.needsWallet).toBeFalsy();
        expect(resp.isComplete).toBeTruthy();
        expect(para.getUserId()).toEqual(USER_ID);
        expect(para.getEmail()).toEqual(USER_EMAIL);
      });
      it('waitForLoginAndSetup - with pregen', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        mockGetPregenWallets.mockResolvedValue({ wallets: PREGEN_WALLETS_EMAIL });
        mockGetWallets.mockResolvedValue({ data: { wallets: [] } });
        mockGetTransmissionKeyshares.mockResolvedValue({ data: { temporaryShares: [] } });

        const pregenWallets = await para.createPregenWalletPerType({
          pregenIdentifier: USER_EMAIL,
          pregenIdentifierType: 'EMAIL',
          types: [WalletType.EVM, WalletType.SOLANA],
        });

        const walletsToSet = {};

        pregenWallets.forEach(w => (walletsToSet[w.id] = w));

        await para.setWallets(walletsToSet);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        await para.initiateUserLogin({ email: USER_EMAIL });
        const resp = await para.waitForLoginAndSetup();

        expect(resp.needsWallet).toBeFalsy();
        expect(resp.isComplete).toBeTruthy();
        expect(para.getUserId()).toEqual(USER_ID);
        expect(para.getEmail()).toEqual(USER_EMAIL);

        const wallets = para.wallets;

        expect(wallets[PREGEN_WALLET_EMAIL.id]).toBeDefined();
        expect(wallets[PREGEN_WALLET_EMAIL.id].pregenIdentifier).toBeUndefined();
        expect(wallets[SOLANA_PREGEN_WALLET_EMAIL.id]).toBeDefined();
        expect(wallets[SOLANA_PREGEN_WALLET_EMAIL.id].pregenIdentifier).toBeUndefined();
        expect(mockDistributeParaShare).toBeCalled();

        mockGetPregenWallets.mockResolvedValue({ wallets: [] });
        mockGetWallets.mockResolvedValue({ data: { wallets: WALLETS } });
        mockGetTransmissionKeyshares.mockResolvedValue({
          data: {
            temporaryShares: SHARES,
          },
        });
      });

      it('exportSession', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        await para.initiateUserLogin({ email: USER_EMAIL });
        await para.waitForLoginAndSetup();

        const session = await para.exportSession();

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

        const para = new MockPara(Environment.DEV, API_KEY);

        await para.importSession(session);

        expect(para.getEmail()).toEqual(USER_EMAIL);
        expect(para.getUserId()).toEqual(USER_ID);
        expect(para.wallets).toEqual({ [WALLET.id]: WALLET });
        expect(para.currentWalletIds).toEqual({ EVM: [WALLET.id] });
      });

      it('keey session alive', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        let isAlive = await para.keepSessionAlive();

        expect(isAlive).toEqual(true);

        mockKeepSessionAlive.mockRejectedValueOnce('error');

        isAlive = await para.keepSessionAlive();

        expect(isAlive).toEqual(false);
      });
    });
  });
  describe('transaction review', () => {
    let para: MockPara;

    beforeAll(async () => {
      para = new MockPara(Environment.DEV, API_KEY);
    });

    it('getTransactionReviewUrl', async () => {
      await para.setUserId(USER_ID);
      await para.setEmail(USER_EMAIL);
      const transactionReviewRes: string = await (para as unknown as any).getTransactionReviewUrl(
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
    let para: MockPara;

    beforeAll(async () => {
      para = new MockPara(Environment.DEV, API_KEY);
    });

    it('getOnRampTransactionUrl', async () => {
      await para.setUserId(USER_ID);
      await para.setCurrentWalletIds(CURRENT_WALLET_IDS);
      const transactionReviewRes: string = await (para as unknown as any).getOnRampTransactionUrl({
        purchaseId: PURCHASE_ID,
        walletId: WALLET.id,
      });

      const url = new URL(transactionReviewRes);
      expect(url.origin).toEqual(getPortalBaseURL(para.ctx));
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
      await para.setUserId(USER_ID);
      await para.setWallets({ [WALLET.id]: WALLET } as unknown as any);
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

      const { onRampPurchase, portalUrl } = await para.initiateOnRampTransaction({
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

      expect(new URL(portalUrl).origin).toEqual(getPortalBaseURL(para.ctx));
      expect(new URL(portalUrl).pathname).toEqual(`/web/users/${USER_ID}/on-ramp-transaction/${onRampPurchase.id}`);

      expect((para as unknown as any).platformUtils.openPopup).toHaveBeenCalledWith(portalUrl, {
        type: PopupType.ON_RAMP_TRANSACTION,
      });

      expect(onRampPurchase).toEqual({ id: 'id', userId: USER_ID, address: WALLET.address, ...params });
    });
  });
  describe('wallets', { timeout: 25000 }, () => {
    describe('new user', () => {
      describe('email', () => {
        let para: MockPara;

        beforeAll(async () => {
          para = new MockPara(Environment.DEV, API_KEY);
        });

        it('waitForPasskeyAndCreateWallet - no pregen', async () => {
          await para.createUser({ email: USER_EMAIL });

          const created = await para.waitForPasskeyAndCreateWallet();
          await para.setCurrentWalletIds(created.walletIds);

          expect(created.walletIds.EVM).toEqual([WALLET.id]);
          expect(created.walletIds.SOLANA).toEqual([SOLANA_WALLET.id]);
          expect(created.walletIds.COSMOS).toBeUndefined();
          expect(mockDistributeParaShare).toBeCalled();
        });
        it('waitForPasskeyAndCreateWallet - pregen', async () => {
          mockGetPregenWallets.mockResolvedValue({ wallets: PREGEN_WALLETS_EMAIL });

          const pregenWallets = await para.createPregenWalletPerType({
            pregenIdentifier: USER_EMAIL,
            pregenIdentifierType: PregenIdentifierType.EMAIL,
            types: [WalletType.EVM, WalletType.SOLANA],
          });

          const walletsToSet = {};

          pregenWallets.forEach(w => (walletsToSet[w.id] = w));

          await para.setWallets(walletsToSet);

          await para.createUser({ email: USER_EMAIL });

          const created = await para.waitForPasskeyAndCreateWallet();
          await para.setCurrentWalletIds(created.walletIds);

          expect(pregenWallets.length).toBe(2);
          expect(created.walletIds.EVM).toEqual([PREGEN_WALLET_EMAIL.id]);
          expect(created.walletIds.SOLANA).toEqual([SOLANA_PREGEN_WALLET_EMAIL.id]);
          expect(created.walletIds.COSMOS).toBeUndefined();

          mockGetPregenWallets.mockResolvedValue({ wallets: [] });
          expect(mockDistributeParaShare).toBeCalled();
        });
      });
      describe('phone', () => {
        let para: MockPara;

        beforeAll(async () => {
          para = new MockPara(Environment.DEV, API_KEY);
        });

        it('waitForPasskeyAndCreateWallet - no pregen', async () => {
          await para.createUserByPhone({ phone: USER_PHONE, countryCode: USER_COUNTRY_CODE as CountryCallingCode });

          const created = await para.waitForPasskeyAndCreateWallet();
          await para.setCurrentWalletIds(created.walletIds);

          expect(created.walletIds.EVM).toEqual([WALLET.id]);
          expect(created.walletIds.SOLANA).toEqual([SOLANA_WALLET.id]);
          expect(created.walletIds.COSMOS).toBeUndefined();
          expect(mockDistributeParaShare).toBeCalled();
        });
        it('waitForPasskeyAndCreateWallet - pregen', async () => {
          mockGetPregenWallets.mockResolvedValue({ wallets: PREGEN_WALLETS_PHONE });
          mockPreKeygen.mockResolvedValueOnce(PREGEN_WALLET_PHONE_KEYGEN_RES);

          const pregenWallets = await para.createPregenWalletPerType({
            pregenIdentifier: `${USER_COUNTRY_CODE}${USER_PHONE}`,
            pregenIdentifierType: 'PHONE',
            types: [WalletType.EVM, WalletType.SOLANA],
          });

          const walletsToSet = {};

          pregenWallets.forEach(w => (walletsToSet[w.id] = w));

          await para.setWallets(walletsToSet);

          await para.createUserByPhone({ phone: USER_PHONE, countryCode: USER_COUNTRY_CODE as CountryCallingCode });

          const created = await para.waitForPasskeyAndCreateWallet();
          await para.setCurrentWalletIds(created.walletIds);

          expect(pregenWallets.length).toBe(2);
          expect(created.walletIds.EVM).toEqual([PREGEN_WALLET_PHONE.id]);
          expect(created.walletIds.SOLANA).toEqual([SOLANA_PREGEN_WALLET_PHONE.id]);
          expect(created.walletIds.COSMOS).toBeUndefined();

          mockGetPregenWallets.mockResolvedValue({ wallets: [] });
          expect(mockDistributeParaShare).toBeCalled();
        });
      });
    });
    describe('transacting', () => {
      let para: MockPara;

      beforeAll(async () => {
        para = new MockPara(Environment.DEV, API_KEY);

        await para.createUser({ email: USER_EMAIL });

        const created = await para.waitForPasskeyAndCreateWallet();
        await para.setCurrentWalletIds(created.walletIds);

        await para.setUserId(USER_ID);
      });

      it('signMessageInner', async () => {
        let res = await (para as unknown as any).signMessageInner({
          wallet: para.wallets[WALLET.id],
          signerId: USER_ID,
          messageBase64: 'message',
          cosmosSignDocBase64: 'cosmosSignDoc',
        });

        expect((para as unknown as any).platformUtils.signMessage).toHaveBeenCalledWith(
          para.ctx,
          USER_ID,
          WALLET.id,
          'test-wallet-signer',
          'message',
          'session-cookie',
          true,
          'cosmosSignDoc',
        );

        expect(res).toEqual({ signature: 'signature' });

        await para.setWallets({ [SOLANA_WALLET.id]: { ...SOLANA_WALLET, signer: 'signer' } } as unknown as Record<
          string,
          Wallet
        >);
        await para.setCurrentWalletIds({ SOLANA: [SOLANA_WALLET.id] });

        res = await (para as unknown as any).signMessageInner({
          wallet: para.wallets[SOLANA_WALLET.id],
          signerId: USER_ID,
          messageBase64: 'message',
        });

        expect((para as unknown as any).platformUtils.ed25519Sign).toHaveBeenCalledWith(
          para.ctx,
          USER_ID,
          SOLANA_WALLET.id,
          'signer',
          'message',
          'session-cookie',
        );

        expect(res).toEqual({ signature: 'signature' });
      });

      it('signTransaction', async () => {
        await para.setWallets({ [WALLET.id]: { ...WALLET, signer: 'signer' } } as unknown as Record<string, Wallet>);
        await para.setCurrentWalletIds({ EVM: [WALLET.id] });

        let res = await para.signTransaction({ walletId: WALLET.id, rlpEncodedTxBase64: 'tx', chainId: '1' });

        expect((para as unknown as any).platformUtils.signTransaction).toHaveBeenCalledWith(
          para.ctx,
          USER_ID,
          WALLET.id,
          'signer',
          'tx',
          '1',
          'session-cookie',
          true,
        );

        expect((res as SuccessfulSignatureRes).signature).toEqual('signature');

        (para as unknown as any).platformUtils.signTransaction.mockReturnValueOnce({
          pendingTransactionId: 'pending-transaction-id',
        });

        expect(para.signTransaction({ walletId: WALLET.id, rlpEncodedTxBase64: 'tx', chainId: '1' })).rejects.toThrowError();

        // expect((res as DeniedSignatureRes).pendingTransactionId).toEqual('pending-transaction-id');

        // expect((para as unknown as any).platformUtils.openPopup).toHaveBeenCalledWith('pending-transaction-id', {
        //   type: PopupType.SIGN_TRANSACTION_REVIEW,
        // });
      });

      it('sendTransaction', async () => {
        await para.setWallets({ [WALLET.id]: { ...WALLET, signer: 'signer' } } as unknown as Record<string, Wallet>);
        await para.setCurrentWalletIds({ EVM: [WALLET.id] });

        let res = await para.sendTransaction({ walletId: WALLET.id, rlpEncodedTxBase64: 'tx', chainId: '1' });

        expect((para as unknown as any).platformUtils.sendTransaction).toHaveBeenCalledWith(
          para.ctx,
          USER_ID,
          WALLET.id,
          'signer',
          'tx',
          '1',
          'session-cookie',
          true,
        );

        expect((res as SuccessfulSignatureRes).signature).toEqual('signature');

        (para as unknown as any).platformUtils.sendTransaction.mockReturnValueOnce({
          pendingTransactionId: 'pending-transaction-id',
        });

        expect(para.sendTransaction({ walletId: WALLET.id, rlpEncodedTxBase64: 'tx', chainId: '1' })).rejects.toThrowError();
      });
    });

    describe('share', () => {
      let para: MockPara;
      beforeAll(async () => {
        para = new MockPara(Environment.DEV, API_KEY);

        await para.createUser({ email: USER_EMAIL });

        const created = await para.waitForPasskeyAndCreateWallet();
        await para.setCurrentWalletIds(created.walletIds);

        await para.setUserId(USER_ID);
      });

      it('refresh share', async () => {
        vi.mocked(shareDistribution.distributeNewShare).mockResolvedValueOnce('recoveryShare');
        const { signer, protocolId, recoverySecret } = await para.refreshShare({
          walletId: WALLET.id,
          share: 'share',
          oldPartnerId: 'oldPartnerId',
          newPartnerId: 'newPartnerId',
          keyShareProtocolId: 'protocolId',
          redistributeBackupEncryptedShares: true,
          emailProps: { homepageUrl: 'homepageUrl' },
        });

        expect((para as unknown as any).platformUtils.refresh).toHaveBeenCalledWith(
          para.ctx,
          'session-cookie',
          USER_ID,
          WALLET.id,
          'share',
          'oldPartnerId',
          'newPartnerId',
          'protocolId',
        );

        expect(shareDistribution.distributeNewShare).toHaveBeenCalledWith({
          ctx: para.ctx,
          userId: USER_ID,
          walletId: WALLET.id,
          userShare: signer,
          emailProps: (para as unknown as any).getBackupKitEmailProps(),
          ignoreRedistributingBackupEncryptedShare: false,
          partnerId: 'newPartnerId',
          protocolId,
        });
        expect(signer).toEqual('test-refresh-signer');
        expect(protocolId).toEqual('protocolId');
        expect(recoverySecret).toEqual('recoveryShare');
      });
    });
    describe('helpers and utils', () => {
      let para: MockPara;

      beforeAll(async () => {
        para = new MockPara(Environment.DEV, API_KEY);

        await para.createUser({ email: USER_EMAIL });

        const created = await para.waitForPasskeyAndCreateWallet();
        await para.setCurrentWalletIds(created.walletIds);
      });

      it('current wallets', async () => {
        const currentWalletIds = para.currentWalletIdsArray;
        expect(currentWalletIds[0][0]).toEqual(WALLET.id);
        expect(currentWalletIds[0][1]).toEqual(WalletType.EVM);
        expect(currentWalletIds[1][0]).toEqual(SOLANA_WALLET.id);
        expect(currentWalletIds[1][1]).toEqual(WalletType.SOLANA);

        const availableWallets = para.availableWallets;
        expect(availableWallets.length).toEqual(2);
        expect(availableWallets[0].id).toEqual(WALLET.id);
        expect(availableWallets[1].id).toEqual(SOLANA_WALLET.id);

        const wallets = para.getWallets();
        expect(wallets[WALLET.id]).toBeDefined();
        expect(wallets[SOLANA_WALLET.id]).toBeDefined();

        const walletsByType = para.getWalletsByType(WalletType.EVM);
        expect(walletsByType.length).toEqual(1);
        expect(walletsByType[0]).toBeDefined();
        expect(walletsByType[0].id).toEqual(WALLET.id);
      });
      it('find wallets by id', async () => {
        const wallet = para.findWallet(SOLANA_WALLET.id);
        expect(wallet).toBeDefined();
        expect(wallet?.id).toEqual(SOLANA_WALLET.id);

        const walletNoId = para.findWallet();
        expect(walletNoId).toBeDefined();
        expect(walletNoId?.id).toEqual(WALLET.id);

        const invalidWallet = para.findWallet('notAnId');
        expect(invalidWallet).toBeUndefined();

        const invalidWalletWithFilters = para.findWallet(SOLANA_WALLET.id, undefined, { type: [WalletType.EVM] });
        expect(invalidWalletWithFilters).toBeUndefined();

        const walletWithTypeOverride = para.findWallet(SOLANA_WALLET.id, WalletType.EVM);
        expect(walletWithTypeOverride).toBeDefined();
        expect(walletWithTypeOverride?.type).toEqual(WalletType.EVM);
      });
      it('find wallets by address', async () => {
        const wallet = para.findWalletByAddress(SOLANA_WALLET.address);
        expect(wallet).toBeDefined();
        expect(wallet.id).toEqual(SOLANA_WALLET.id);

        expect(() => para.findWalletByAddress('notAnAddress')).toThrowError('wallet with address notAnAddress not found');
        expect(() => para.findWalletByAddress(SOLANA_WALLET.address, { type: [WalletType.EVM] })).toThrowError(
          `wallet with id ${SOLANA_WALLET.id} and type ${SOLANA_WALLET.type} cannot be selected`,
        );
      });
      it('random wallet utils', async () => {
        const isMultiWallet = para.isMultiWallet;
        expect(isMultiWallet).toBeTruthy();

        const walletAddress = para.getAddress(SOLANA_WALLET.id);
        expect(walletAddress).toEqual(SOLANA_WALLET.address);

        const privateKey = await (para as unknown as any).getPrivateKey(WALLET.id);
        expect(privateKey).toEqual('getPrivateKey');

        const privateKeyNoId = await (para as unknown as any).getPrivateKey();
        expect(privateKeyNoId).toEqual('getPrivateKey');

        await expect((para as unknown as any).getPrivateKey(SOLANA_WALLET.id)).rejects.toThrowError('invalid wallet scheme');
      });
      it('pregen utils', async () => {
        para.wallets[WALLET.id] = {
          ...para.wallets[WALLET.id],
          isPregen: true,
          pregenIdentifierType: 'EMAIL',
          pregenIdentifier: USER_EMAIL,
        };

        await para.updatePregenWalletIdentifier({
          newPregenIdentifier: 'test email',
          walletId: WALLET.id,
          newPregenIdentifierType: PregenIdentifierType.EMAIL,
        });
        expect(mockUpdatePregenWallet).toBeCalledWith(WALLET.id, {
          pregenIdentifier: 'test email',
          pregenIdentifierType: PregenIdentifierType.EMAIL,
        });
        expect(para.wallets[WALLET.id].pregenIdentifier).toEqual('test email');
        expect(para.wallets[WALLET.id].pregenIdentifierType).toEqual(PregenIdentifierType.EMAIL);

        const hasPregenFalsy = await para.hasPregenWallet({
          pregenIdentifier: USER_EMAIL,
          pregenIdentifierType: PregenIdentifierType.EMAIL,
        });
        expect(mockGetPregenWallets).toBeCalledWith({ EMAIL: [USER_EMAIL] }, false, para.getUserId());
        expect(hasPregenFalsy).toBeFalsy();

        const pregenNoWallets = await para.getPregenWallets({
          pregenIdentifier: USER_EMAIL,
          pregenIdentifierType: PregenIdentifierType.EMAIL,
        });
        expect(mockGetPregenWallets).toBeCalledWith({ EMAIL: [USER_EMAIL] }, false, para.getUserId());
        expect(pregenNoWallets.length).toEqual(0);

        mockGetPregenWallets.mockResolvedValue({ wallets: PREGEN_WALLETS_EMAIL });
        const hasPregen = await para.hasPregenWallet({
          pregenIdentifier: USER_EMAIL,
          pregenIdentifierType: PregenIdentifierType.EMAIL,
        });
        expect(mockGetPregenWallets).toBeCalledWith({ EMAIL: [USER_EMAIL] }, false, para.getUserId());
        expect(hasPregen).toBeTruthy();

        const pregenWallets = await para.getPregenWallets({
          pregenIdentifier: USER_EMAIL,
          pregenIdentifierType: PregenIdentifierType.EMAIL,
        });
        expect(mockGetPregenWallets).toBeCalledWith({ EMAIL: [USER_EMAIL] }, false, para.getUserId());
        expect(pregenWallets.length).toEqual(2);

        const encodedWallets = Object.values(para.wallets)
          .map(wallet => Buffer.from(JSON.stringify(wallet)).toString('base64'))
          .join('-');
        const userShare = para.getUserShare();
        expect(userShare).toEqual(encodedWallets);

        // Reset wallets to test setting user share
        await para.setWallets({});
        expect(Object.keys(para.wallets).length).toEqual(0);
        await para.setUserShare(userShare);
        expect(Object.keys(para.wallets).length).toEqual(2);
        expect(para.wallets[WALLET.id]).toBeDefined;
        expect(para.wallets[SOLANA_WALLET.id]).toBeDefined;
      });
      it('supported auth methods', async () => {
        const supportedAuthMethods = await (para as unknown as any).getSupportedCreateAuthMethods();

        expect(mockTouchSession).toHaveBeenCalled();

        expect(supportedAuthMethods).toEqual(new Set([AuthMethod.PASSKEY, AuthMethod.PASSWORD]));
      });
    });
  });
  describe('loops', () => {
    let para: MockPara;

    beforeAll(async () => {
      para = new MockPara(Environment.DEV, API_KEY);
    });

    it('exitAccountCreation', () => {
      (para as unknown as any).isAwaitingAccountCreation = true;

      expect((para as unknown as any).isAwaitingAccountCreation).toBeTruthy();

      (para as unknown as any).exitAccountCreation();

      expect((para as unknown as any).isAwaitingAccountCreation).toBeFalsy();
    });

    it('exitLogin', () => {
      (para as unknown as any).isAwaitingLogin = true;

      expect((para as unknown as any).isAwaitingLogin).toBeTruthy();

      (para as unknown as any).exitLogin();

      expect((para as unknown as any).isAwaitingLogin).toBeFalsy();
    });

    it('exitFarcaster', () => {
      (para as unknown as any).isAwaitingFarcaster = true;

      expect((para as unknown as any).isAwaitingFarcaster).toBeTruthy();

      (para as unknown as any).exitFarcaster();

      expect((para as unknown as any).isAwaitingFarcaster).toBeFalsy();
    });

    it('exitOAuth', () => {
      (para as unknown as any).isAwaitingOAuth = true;

      expect((para as unknown as any).isAwaitingOAuth).toBeTruthy();

      (para as unknown as any).exitOAuth();

      expect((para as unknown as any).isAwaitingOAuth).toBeFalsy();
    });

    it('exitLoops', () => {
      (para as unknown as any).isAwaitingLogin = true;
      (para as unknown as any).isAwaitingAccountCreation = true;
      (para as unknown as any).isAwaitingFarcaster = true;
      (para as unknown as any).isAwaitingOAuth = true;

      (para as unknown as any).exitLoops();

      expect((para as unknown as any).isAwaitingLogin).toBeFalsy();
      expect((para as unknown as any).isAwaitingAccountCreation).toBeFalsy();
      expect((para as unknown as any).isAwaitingFarcaster).toBeFalsy();
      expect((para as unknown as any).isAwaitingOAuth).toBeFalsy();
    });
  });
  describe('2FA', () => {
    let para: MockPara;

    beforeAll(async () => {
      para = new MockPara(Environment.DEV, API_KEY);

      await para.setUserId(USER_ID);
    });
    describe('check, setup & enable', () => {
      it('check - pass', async () => {
        const { isSetup } = await para.check2FAStatus();

        expect(isSetup).toBeTruthy();
      });
      it('check - fail no user id', async () => {
        await para.logout();

        const { isSetup } = await para.check2FAStatus();

        await para.setUserId(USER_ID);

        expect(isSetup).toBeFalsy();
      });
      it('check - fail api', async () => {
        mockCheck2FAStatus.mockResolvedValueOnce({ data: { isSetup: false } });

        const { isSetup } = await para.check2FAStatus();

        expect(isSetup).toBeFalsy();
      });
      it('setup', async () => {
        const { uri } = await para.setup2FA();

        expect(uri).toEqual(TWOFA_URI);
      });
      it('enable - pass', async () => {
        await expect(para.enable2FA({ verificationCode: '123456' })).resolves.not.toThrowError();
      });
      it('enable - pass', async () => {
        mockEnable2FA.mockRejectedValueOnce('invalid');
        await expect(para.enable2FA({ verificationCode: '123456' })).rejects.toThrowError();
      });
    });
    describe('verify', () => {
      it('email', async () => {
        const resp = await para.verify2FA({ email: USER_EMAIL, verificationCode: '123456' });

        expect(resp).toEqual(TWOFA_VERIFY_RESP);
      });
      it('email - fail', async () => {
        mockVerify2FA.mockRejectedValueOnce('invalid');
        await expect(para.verify2FA({ email: USER_EMAIL, verificationCode: '123456' })).rejects.toThrowError();
      });
      it('phone', async () => {
        const resp = await para.verify2FAForPhone({
          phone: USER_PHONE,
          countryCode: USER_COUNTRY_CODE,
          verificationCode: '123456',
        });

        expect(resp).toEqual(TWOFA_VERIFY_RESP);
      });
      it('email - fail', async () => {
        mockVerify2FAForPhone.mockRejectedValueOnce('invalid');
        await expect(
          para.verify2FAForPhone({ phone: USER_PHONE, countryCode: USER_COUNTRY_CODE, verificationCode: '123456' }),
        ).rejects.toThrowError();
      });
    });
  });

  describe('Para URL validation', () => {
    let para: MockPara;

    beforeAll(() => {
      para = new MockPara(Environment.DEV, API_KEY);
    });

    describe('isPortal', () => {
      it('should return true when host matches portal URL', () => {
        vi.spyOn(window, 'location', 'get').mockReturnValue({ host: 'localhost:3003' } as Location);
        expect((para as unknown as any).isPortal()).toBe(true);
        expect(para).toBeDefined();
      });

      it('should return false when host does not match portal URL', () => {
        vi.spyOn(window, 'location', 'get').mockReturnValue({ host: 'different-host.com' } as Location);
        expect((para as unknown as any).isPortal()).toBe(false);
        expect(para).toBeDefined();
      });

      it('should return true when host matches portal URL with environment override', () => {
        vi.spyOn(window, 'location', 'get').mockReturnValue({ host: 'app.sandbox.usecapsule.com' } as Location);
        expect((para as unknown as any).isPortal(Environment.SANDBOX)).toBe(true);
      });
    });

    describe('isParaConnect', () => {
      it('should return true when host matches para connect URL', () => {
        vi.spyOn(window, 'location', 'get').mockReturnValue({ host: 'localhost:3008' } as Location);
        expect((para as unknown as any).isParaConnect()).toBe(true);
        expect(para).toBeDefined();
      });

      it('should return false when host does not match para connect URL', () => {
        vi.spyOn(window, 'location', 'get').mockReturnValue({ host: 'different-host.com' } as Location);
        expect((para as unknown as any).isParaConnect()).toBe(false);
        expect(para).toBeDefined();
      });
    });
  });
});
