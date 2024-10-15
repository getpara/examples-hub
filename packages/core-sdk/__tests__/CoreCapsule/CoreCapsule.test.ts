import { describe, vi, afterEach, expect, it } from 'vitest';

import CoreCapsule, { Environment } from '../../src';
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
} from '../constants';
import { MockCapsule } from '../mocks/mockCoreCapsule';
import {
  mockAddSessionPublicKey,
  mockCheckUserExists,
  mockCreateUser,
  mockExternalWalletLogin,
  mockVerifyEmail,
  mockVerifyPhone,
} from '../mocks/mockUserManagementClient';
import { CountryCallingCode } from 'libphonenumber-js';
import { PublicKeyStatus, PublicKeyType } from '@usecapsule/user-management-client';
import { toQueryString } from '../../src/CoreCapsule';

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
      const LOGIN_ERROR = 'Login Error';
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
});
