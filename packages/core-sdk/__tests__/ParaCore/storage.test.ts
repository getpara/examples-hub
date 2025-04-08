/// <reference lib="dom" />
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockPara } from '../mocks/mockParaCore';
import { Environment } from '../../src';
import { API_KEY } from '../constants';
import {
  LOCAL_STORAGE_AUTH_INFO,
  LOCAL_STORAGE_CURRENT_WALLET_IDS,
  LOCAL_STORAGE_ED25519_WALLETS,
  LOCAL_STORAGE_EXTERNAL_WALLETS,
  LOCAL_STORAGE_SESSION_COOKIE,
  LOCAL_STORAGE_USER_ID,
  LOCAL_STORAGE_WALLETS,
  SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR,
} from '../../src/constants';
import { storageListener } from '../../src/utils';
import { prepareMock, prepareMockSession } from '../utils';
import _ from 'lodash';

describe('ParaCore > storage', () => {
  let para: MockPara;

  beforeEach(() => {
    para = new MockPara(Environment.DEV, API_KEY);
  });

  describe('storage listeners', () => {
    it('succeeds from another origin', () => {
      const spy = vi.spyOn(para as any, 'updateAuthInfoFromStorage');

      storageListener.bind(para)({
        key: LOCAL_STORAGE_AUTH_INFO,
        url: 'https://test.com',
      } as StorageEvent);

      expect(spy).toBeCalledTimes(0);
    });
    it('updateUserIdFromStorage succeeds', () => {
      const spy = vi.spyOn(para as any, 'updateUserIdFromStorage');

      storageListener.bind(para)({
        key: LOCAL_STORAGE_USER_ID,
        url: 'http://localhost:3000',
      } as StorageEvent);

      expect(spy).toBeCalledTimes(1);
    });
    it('updateAuthInfoFromStorage succeeds', () => {
      const spy = vi.spyOn(para as any, 'updateAuthInfoFromStorage');

      storageListener.bind(para)({
        key: LOCAL_STORAGE_AUTH_INFO,
        url: 'http://localhost:3000',
      } as StorageEvent);

      expect(spy).toBeCalledTimes(1);
    });
    it('updateWalletsFromStorage succeeds', () => {
      const spy = vi.spyOn(para as any, 'updateWalletsFromStorage');

      storageListener.bind(para)({
        key: LOCAL_STORAGE_ED25519_WALLETS,
        url: 'http://localhost:3000',
      } as StorageEvent);

      expect(spy).toBeCalledTimes(1);
    });
    it('updateWalletsFromStorage succeeds', () => {
      const spy = vi.spyOn(para as any, 'updateWalletsFromStorage');

      storageListener.bind(para)({
        key: LOCAL_STORAGE_WALLETS,
        url: 'http://localhost:3000',
      } as StorageEvent);

      expect(spy).toBeCalledTimes(1);
    });
    it('updateWalletIdsFromStorage succeeds', () => {
      const para = new MockPara(Environment.DEV, API_KEY);
      const spy = vi.spyOn(para as any, 'updateWalletIdsFromStorage');

      storageListener.bind(para)({
        key: LOCAL_STORAGE_CURRENT_WALLET_IDS,
        url: 'http://localhost:3000',
      } as StorageEvent);

      expect(spy).toBeCalledTimes(1);
    });
    it('updateSessionCookieFromStorage', () => {
      const spy = vi.spyOn(para as any, 'updateSessionCookieFromStorage');

      storageListener.bind(para)({
        key: LOCAL_STORAGE_SESSION_COOKIE,
        url: 'http://localhost:3000',
      } as StorageEvent);

      expect(spy).toBeCalledTimes(1);
    });
    it('updateLoginEncryptionKeyPairFromStorage', () => {
      const spy = vi.spyOn(para as any, 'updateLoginEncryptionKeyPairFromStorage');

      storageListener.bind(para)({
        key: SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR,
        url: 'http://localhost:3000',
      } as StorageEvent);

      expect(spy).toBeCalledTimes(1);
    });
    it('updateExternalWalletsFromStorage', () => {
      const spy = vi.spyOn(para as any, 'updateExternalWalletsFromStorage');

      storageListener.bind(para)({
        key: LOCAL_STORAGE_EXTERNAL_WALLETS,
        url: 'http://localhost:3000',
      } as StorageEvent);

      expect(spy).toBeCalledTimes(1);
    });
  });

  it('exportSession succeeds', async () => {
    await prepareMock(para);

    const expectedSession = {
      authInfo: para.authInfo,
      userId: para.userId,
      wallets: para.wallets,
      currentWalletIds: para.currentWalletIds,
      sessionCookie: para.retrieveSessionCookie(),
      externalWallets: para.externalWallets,
    };

    const session = para.exportSession();

    expect(JSON.parse(Buffer.from(session, 'base64').toString())).toStrictEqual(expectedSession);
  });

  it('importSession succeeds', async () => {
    const { session, sessionInfo } = await prepareMockSession();

    await para.importSession(session);

    expect(para.authInfo).toStrictEqual(sessionInfo.authInfo);
    expect(para.userId).toStrictEqual(sessionInfo.userId);
    expect(para.wallets).toStrictEqual(sessionInfo.wallets);
    expect(para.currentWalletIds).toStrictEqual(sessionInfo.currentWalletIds);
    expect(para.retrieveSessionCookie()).toStrictEqual(sessionInfo.sessionCookie);
    expect(para.externalWallets).toStrictEqual(sessionInfo.externalWallets);
  });
});
