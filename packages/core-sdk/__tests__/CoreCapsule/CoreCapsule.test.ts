import { describe, vi, afterEach, expect, it, beforeAll } from 'vitest';

import CoreCapsule, { Environment, getPublicKeyHex, OAuthMethod } from '../../src/index.js';
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
} from '../constants';
import { MockCapsule } from '../mocks/mockCoreCapsule.js';
import {
  mockAddSessionPublicKey,
  mockCheck2FAStatus,
  mockCheckUserExists,
  mockCreateUser,
  mockDistributeCapsuleShare,
  mockEnable2FA,
  mockExternalWalletLogin,
  mockGetFarcasterAuthStatus,
  mockGetPregenWallets,
  mockGetTransmissionKeyshares,
  mockGetWallets,
  mockUpdatePregenWallet,
  mockVerify2FA,
  mockVerify2FAForPhone,
  mockVerifyEmail,
  mockVerifyPhone,
} from '../mocks/mockUserManagementClient';
import { CountryCallingCode } from 'libphonenumber-js';
import { PublicKeyStatus, PublicKeyType, WalletType } from '@usecapsule/user-management-client';
import { PregenIdentifierType, toQueryString } from '../../src/CoreCapsule.js';
import { getWorkerContent } from '../utils.js';
import { mockPreKeygen } from '../mocks/mockPlatformUtils.js';

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

        expect(mockCheckUserExists).toBeCalledWith(USER_EMAIL, null, null);
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

        expect(mockCheckUserExists).toBeCalledWith(USER_EMAIL, null, null);
        expect(userExists).toBeFalsy();
      });
      it('verify', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        await capsule.createUser(USER_EMAIL);

        const setupUrl = await capsule.verifyEmail(VERIFICATION_CODE);

        expect(mockVerifyEmail).toBeCalledWith(USER_ID, { verificationCode: VERIFICATION_CODE });
        expect(mockAddSessionPublicKey).toBeCalledWith(USER_ID, {
          status: PublicKeyStatus.PENDING,
          type: PublicKeyType.WEB,
        });
        expect(setupUrl).toEqual(
          `https://test.com/web/users/${USER_ID}/biometrics/${SESSION_ID}?email=${encodeURIComponent(USER_EMAIL)}${toQueryString(
            {
              apiKey: PARTNER.apiKey,
              partnerId: PARTNER.id,
              portalFont: PARTNER.font,
              portalThemeMode: PARTNER.themeMode,
              portalAccentColor: PARTNER.accentColor,
              portalForegroundColor: PARTNER.foregroundColor,
              portalBackgroundColor: PARTNER.backgroundColor,
            },
          )}`,
        );
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
    });
    describe('phone', () => {
      it('creates a new user', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const userExists = await capsule.checkIfUserExistsByPhone(USER_PHONE, USER_COUNTRY_CODE as CountryCallingCode);

        expect(mockCheckUserExists).toBeCalledWith(null, USER_PHONE, USER_COUNTRY_CODE);
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

      it("user doesn't exists", async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        mockCheckUserExists.mockResolvedValueOnce({ data: { exists: false } });

        const userExists = await capsule.checkIfUserExistsByPhone(USER_PHONE, USER_COUNTRY_CODE as CountryCallingCode);

        expect(mockCheckUserExists).toBeCalledWith(null, USER_PHONE, USER_COUNTRY_CODE);
        expect(userExists).toBeFalsy();
      });
      it('verify', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        await capsule.createUserByPhone(USER_PHONE, USER_COUNTRY_CODE as CountryCallingCode);

        const setupUrl = await capsule.verifyPhone(VERIFICATION_CODE);

        expect(mockVerifyPhone).toBeCalledWith(USER_ID, { verificationCode: VERIFICATION_CODE });
        expect(mockAddSessionPublicKey).toBeCalledWith(USER_ID, {
          status: PublicKeyStatus.PENDING,
          type: PublicKeyType.WEB,
        });
        expect(setupUrl).toEqual(
          `https://test.com/web/users/${USER_ID}/biometrics/${SESSION_ID}?phone=${encodeURIComponent(USER_PHONE)}&countryCode=${encodeURIComponent(USER_COUNTRY_CODE)}${toQueryString(
            {
              apiKey: PARTNER.apiKey,
              partnerId: PARTNER.id,
              portalFont: PARTNER.font,
              portalThemeMode: PARTNER.themeMode,
              portalAccentColor: PARTNER.accentColor,
              portalForegroundColor: PARTNER.foregroundColor,
              portalBackgroundColor: PARTNER.backgroundColor,
            },
          )}`,
        );
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

        const loginLink = await capsule.initiateUserLogin(USER_EMAIL);

        expect(loginLink).toEqual(
          `https://test.com/web/biometrics/login?email=${encodeURIComponent(USER_EMAIL)}&sessionId=${SESSION_ID}&encryptionKey=${getPublicKeyHex(capsule.loginEncryptionKeyPair!)}${toQueryString(
            {
              pregenWalletIds: '',
            },
          )}${toQueryString({
            apiKey: PARTNER.apiKey,
            partnerId: PARTNER.id,
            portalFont: PARTNER.font,
            portalThemeMode: PARTNER.themeMode,
            portalAccentColor: PARTNER.accentColor,
            portalForegroundColor: PARTNER.foregroundColor,
            portalBackgroundColor: PARTNER.backgroundColor,
          })}`,
        );
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

        expect(loginLink).toContain(`http://localhost:3003/short/${TEMP_TRANSMISSION_INIT_ID}`);
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

        const loginLink = await capsule.initiateUserLogin(
          USER_PHONE,
          false,
          'phone',
          USER_COUNTRY_CODE as CountryCallingCode,
        );

        expect(loginLink).toEqual(
          `https://test.com/web/biometrics/login?phone=${encodeURIComponent(USER_PHONE)}&countryCode=${encodeURIComponent(USER_COUNTRY_CODE)}&sessionId=${SESSION_ID}&encryptionKey=${getPublicKeyHex(capsule.loginEncryptionKeyPair!)}${toQueryString(
            {
              pregenWalletIds: '',
            },
          )}${toQueryString({
            apiKey: PARTNER.apiKey,
            partnerId: PARTNER.id,
            portalFont: PARTNER.font,
            portalThemeMode: PARTNER.themeMode,
            portalAccentColor: PARTNER.accentColor,
            portalForegroundColor: PARTNER.foregroundColor,
            portalBackgroundColor: PARTNER.backgroundColor,
          })}`,
        );
      });
      it('initiates login - phone only method', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const workerFileContent = await getWorkerContent();

        global.fetch = vi.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve(workerFileContent),
          } as Response),
        );

        const loginLink = await capsule.initiateUserLoginForPhone(USER_PHONE, USER_COUNTRY_CODE as CountryCallingCode);

        expect(loginLink).toEqual(
          `https://test.com/web/biometrics/login?phone=${encodeURIComponent(USER_PHONE)}&countryCode=${encodeURIComponent(USER_COUNTRY_CODE)}&sessionId=${SESSION_ID}&encryptionKey=${getPublicKeyHex(capsule.loginEncryptionKeyPair!)}${toQueryString(
            {
              pregenWalletIds: '',
            },
          )}${toQueryString({
            apiKey: PARTNER.apiKey,
            partnerId: PARTNER.id,
            portalFont: PARTNER.font,
            portalThemeMode: PARTNER.themeMode,
            portalAccentColor: PARTNER.accentColor,
            portalForegroundColor: PARTNER.foregroundColor,
            portalBackgroundColor: PARTNER.backgroundColor,
          })}`,
        );
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

        expect(userExists).toBeTruthy();
        expect(username).toEqual(USER_FARCASTER_USERNAME);
        expect(capsule.getUserId()).toEqual(USER_ID);
      });
      it('wait for login fails', async () => {
        mockGetFarcasterAuthStatus.mockRejectedValueOnce(LOGIN_ERROR);

        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const waitResp = await capsule.waitForFarcasterStatus();

        await expect(waitResp).toBeUndefined();
      });
    });
    describe('oauth', () => {
      it('get url', async () => {
        const capsule = new MockCapsule(Environment.DEV, API_KEY);

        const uri = await capsule.getOAuthURL(OAuthMethod.GOOGLE);

        expect(uri).toEqual(`http://localhost:8080/auth/google?sessionLookupId=${encodeURIComponent(SESSION_LOOKUP_ID)}`);
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
    });
  });
  describe('wallets', { timeout: 25000 }, () => {
    describe('new user', () => {
      describe('email', () => {
        let capsule: MockCapsule | undefined;

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
        let capsule: MockCapsule | undefined;

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
    describe('helpers and utils', () => {
      let capsule: MockCapsule | undefined;

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
        expect(wallet.id).toEqual(SOLANA_WALLET.id);

        const walletNoId = capsule.findWallet();
        expect(walletNoId).toBeDefined();
        expect(walletNoId.id).toEqual(WALLET.id);

        const invalidWallet = capsule.findWallet('notAnId');
        expect(invalidWallet).toBeUndefined();

        const invalidWalletWithFilters = capsule.findWallet(SOLANA_WALLET.id, undefined, { type: [WalletType.EVM] });
        expect(invalidWalletWithFilters).toBeUndefined();

        const walletWithTypeOverride = capsule.findWallet(SOLANA_WALLET.id, WalletType.EVM);
        expect(walletWithTypeOverride).toBeDefined();
        expect(walletWithTypeOverride.type).toEqual(WalletType.EVM);
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
        await capsule.updateWalletIdentifierPreGen('test email', PREGEN_WALLET_EMAIL.id, PregenIdentifierType.EMAIL);
        expect(mockUpdatePregenWallet).toBeCalledWith(PREGEN_WALLET_EMAIL.id, {
          pregenIdentifier: 'test email',
          pregenIdentifierType: PregenIdentifierType.EMAIL,
        });

        const hasPregenFalsy = await capsule.hasPregenWallet(USER_EMAIL, PregenIdentifierType.EMAIL);
        expect(mockGetPregenWallets).toBeCalledWith(USER_EMAIL, PregenIdentifierType.EMAIL);
        expect(hasPregenFalsy).toBeFalsy();

        const pregenNoWallets = await capsule.getPregenWallets(USER_EMAIL, PregenIdentifierType.EMAIL);
        expect(mockGetPregenWallets).toBeCalledWith(USER_EMAIL, PregenIdentifierType.EMAIL);
        expect(pregenNoWallets.length).toEqual(0);

        mockGetPregenWallets.mockResolvedValue({ wallets: PREGEN_WALLETS_EMAIL });
        const hasPregen = await capsule.hasPregenWallet(USER_EMAIL, PregenIdentifierType.EMAIL);
        expect(mockGetPregenWallets).toBeCalledWith(USER_EMAIL, PregenIdentifierType.EMAIL);
        expect(hasPregen).toBeTruthy();

        const pregenWallets = await capsule.getPregenWallets(USER_EMAIL, PregenIdentifierType.EMAIL);
        expect(mockGetPregenWallets).toBeCalledWith(USER_EMAIL, PregenIdentifierType.EMAIL);
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
    });
  });
  describe('2FA', () => {
    let capsule: MockCapsule | undefined;

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
