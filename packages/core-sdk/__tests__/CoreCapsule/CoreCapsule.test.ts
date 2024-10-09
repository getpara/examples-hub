import { describe, vi, afterEach, expect, it } from 'vitest';

import CoreCapsule, { Environment } from '../../src';
import { API_KEY, EXTERNAL_WALLET, STORED_EXTERNAL_WALLET } from '../constants';
import { MockCapsule } from '../mocks/mockCoreCapsule';
import { mockExternalWalletLogin } from '../mocks/mockUserManagementClient';

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

      expect(capsule.externalWallets).toEqual({
        [address]: STORED_EXTERNAL_WALLET,
      });
      expect(capsule.currentExternalWalletAddresses).toEqual([address]);
      expect(capsule.isUsingExternalWallet()).toBeTruthy();
      expect(isFullyLoggedIn).toBeTruthy();
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
});
