import { describe, expect, it, vi, afterEach } from 'vitest';
import { ServerUtils } from '../src/ServerUtils.js';
import * as privateKey from '../src/wallet/privateKey.js';
import { BASE64_BYTES, CHAIN, MESSAGE, PARTNER, SECRET_KEY, SIGNATURE, TX, USER, WALLET } from './constants.js';
import { TEST_CTX } from './setup.js';
import { EmailTheme } from '@getpara/user-management-client';
import * as keygen from '../src/wallet/keygen.js';
import * as signing from '../src/wallet/signing.js';
import { ServerLocalStorage } from '../src/ServerLocalStorage.js';
import { ServerSessionStorage } from '../src/ServerSessionStorage.js';

const getPrivateKeySpy = vi.spyOn(privateKey, 'getPrivateKey').mockImplementation(async () => WALLET.privateKey);
const keygenSpy = vi.spyOn(keygen, 'keygen').mockImplementation(async () => ({
  signer: WALLET.signer,
  walletId: WALLET.id,
  recoveryShare: null,
}));
const preKeygenSpy = vi.spyOn(keygen, 'preKeygen').mockImplementation(async () => ({
  signer: WALLET.signer,
  walletId: WALLET.id,
  recoveryShare: null,
}));
const ed25519KeygenSpy = vi.spyOn(keygen, 'ed25519Keygen').mockImplementation(async () => ({
  signer: WALLET.signer,
  walletId: WALLET.id,
  recoveryShare: null,
}));
const ed25519PreKeygenSpy = vi.spyOn(keygen, 'ed25519PreKeygen').mockImplementation(async () => ({
  signer: WALLET.signer,
  walletId: WALLET.id,
  recoveryShare: null,
}));
const initializeWorkerSpy = vi.spyOn(keygen, 'initializeWorker').mockImplementation(async () => undefined);

const signMessageSpy = vi.spyOn(signing, 'signMessage').mockImplementation(async () => ({
  signature: SIGNATURE,
}));
const signTransactionSpy = vi.spyOn(signing, 'signTransaction').mockImplementation(async () => ({
  signature: SIGNATURE,
}));
const sendTransactionSpy = vi.spyOn(signing, 'sendTransaction').mockImplementation(async () => ({
  signature: SIGNATURE,
}));
const ed25519SignSpy = vi.spyOn(signing, 'ed25519Sign').mockImplementation(async () => ({
  signature: SIGNATURE,
}));

describe('ServerUtils', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('constructor', () => {
    const serverUtils = new ServerUtils();

    expect(serverUtils).toBeInstanceOf(ServerUtils);
    expect(serverUtils.localStorage).toBeInstanceOf(ServerLocalStorage);
    expect(serverUtils.sessionStorage).toBeInstanceOf(ServerSessionStorage);
    expect(serverUtils.isSyncStorage).toBe(true);
    expect(serverUtils.disableProviderModal).toBe(true);
    expect(serverUtils.secureStorage).toBeUndefined();
  });

  it('getPrivateKey', async () => {
    const serverUtils = new ServerUtils();

    const resp = await serverUtils.getPrivateKey(TEST_CTX, USER.id, WALLET.id, WALLET.share, USER.sessionCookie);

    expect(resp).toBe(WALLET.privateKey);
    expect(getPrivateKeySpy).toBeCalledTimes(1);
    expect(getPrivateKeySpy).toBeCalledWith(TEST_CTX, USER.id, WALLET.id, WALLET.share, USER.sessionCookie);
  });

  it('keygen', async () => {
    const serverUtils = new ServerUtils();
    const emailProps = {
      homepageUrl: 'https://getpara.com',
      supportUrl: 'https://support.getpara.com',
      theme: EmailTheme.LIGHT,
    };

    const resp = await serverUtils.keygen(TEST_CTX, USER.id, 'EVM', SECRET_KEY, USER.sessionCookie, emailProps);

    expect(resp).toMatchObject({
      signer: WALLET.signer,
      walletId: WALLET.id,
    });
    expect(keygenSpy).toBeCalledTimes(1);
    expect(keygenSpy).toBeCalledWith(TEST_CTX, USER.id, 'EVM', SECRET_KEY, USER.sessionCookie, emailProps);
  });

  it('refresh throws error', async () => {
    const serverUtils = new ServerUtils();

    expect(() =>
      serverUtils.refresh(TEST_CTX, USER.sessionCookie, USER.id, WALLET.id, WALLET.share, PARTNER.id, PARTNER.id),
    ).toThrow('Refresh function is not implemented in the ServerUtils class.');
  });

  it('preKeygen', async () => {
    const serverUtils = new ServerUtils();

    const resp = await serverUtils.preKeygen(
      TEST_CTX,
      PARTNER.id,
      USER.email,
      'EMAIL',
      'EVM',
      SECRET_KEY,
      USER.sessionCookie,
    );

    expect(resp).toMatchObject({
      signer: WALLET.signer,
      walletId: WALLET.id,
    });
    expect(preKeygenSpy).toBeCalledTimes(1);
    expect(preKeygenSpy).toBeCalledWith(
      TEST_CTX,
      USER.email,
      'EMAIL',
      'EVM',
      SECRET_KEY,
      false,
      PARTNER.id,
      USER.sessionCookie,
    );
  });

  it('signMessage', async () => {
    const serverUtils = new ServerUtils();

    const resp = await serverUtils.signMessage(
      TEST_CTX,
      USER.id,
      WALLET.id,
      WALLET.share,
      MESSAGE,
      USER.sessionCookie,
      true,
    );

    expect(resp).toStrictEqual({
      signature: SIGNATURE,
    });
    expect(signMessageSpy).toBeCalledTimes(1);
    expect(signMessageSpy).toBeCalledWith(TEST_CTX, USER.id, WALLET.id, WALLET.share, MESSAGE, USER.sessionCookie, true);
  });

  it('signTransaction', async () => {
    const serverUtils = new ServerUtils();

    const resp = await serverUtils.signTransaction(
      TEST_CTX,
      USER.id,
      WALLET.id,
      WALLET.share,
      TX,
      CHAIN,
      USER.sessionCookie,
      true,
    );

    expect(resp).toStrictEqual({
      signature: SIGNATURE,
    });
    expect(signTransactionSpy).toBeCalledTimes(1);
    expect(signTransactionSpy).toBeCalledWith(
      TEST_CTX,
      USER.id,
      WALLET.id,
      WALLET.share,
      TX,
      CHAIN,
      USER.sessionCookie,
      true,
    );
  });

  it('sendTransaction', async () => {
    const serverUtils = new ServerUtils();

    const resp = await serverUtils.sendTransaction(
      TEST_CTX,
      USER.id,
      WALLET.id,
      WALLET.share,
      TX,
      CHAIN,
      USER.sessionCookie,
      true,
    );

    expect(resp).toStrictEqual({
      signature: SIGNATURE,
    });
    expect(sendTransactionSpy).toBeCalledTimes(1);
    expect(sendTransactionSpy).toBeCalledWith(
      TEST_CTX,
      USER.id,
      WALLET.id,
      WALLET.share,
      TX,
      CHAIN,
      USER.sessionCookie,
      true,
    );
  });

  it('signHash throws error', async () => {
    const serverUtils = new ServerUtils();

    expect(() => serverUtils.signHash('address', 'hash')).toThrow('SignHash is not implemented in the ServerUtils class.');
  });

  it('ed25519Keygen', async () => {
    const serverUtils = new ServerUtils();
    const emailProps = {
      homepageUrl: 'https://getpara.com',
      supportUrl: 'https://support.getpara.com',
      theme: EmailTheme.LIGHT,
    };

    const resp = await serverUtils.ed25519Keygen(TEST_CTX, USER.id, USER.sessionCookie, emailProps);

    expect(resp).toMatchObject({
      signer: WALLET.signer,
      walletId: WALLET.id,
    });
    expect(ed25519KeygenSpy).toBeCalledTimes(1);
    expect(ed25519KeygenSpy).toBeCalledWith(TEST_CTX, USER.id, USER.sessionCookie, emailProps);
  });

  it('ed25519PreKeygen', async () => {
    const serverUtils = new ServerUtils();

    const resp = await serverUtils.ed25519PreKeygen(TEST_CTX, USER.email, 'EMAIL', USER.sessionCookie);

    expect(resp).toStrictEqual({
      recoveryShare: null,
      signer: WALLET.signer,
      walletId: WALLET.id,
    });
    expect(ed25519PreKeygenSpy).toBeCalledTimes(1);
    expect(ed25519PreKeygenSpy).toBeCalledWith(TEST_CTX, USER.email, 'EMAIL', USER.sessionCookie);
  });

  it('ed25519Sign', async () => {
    const serverUtils = new ServerUtils();

    const resp = await serverUtils.ed25519Sign(TEST_CTX, USER.id, WALLET.id, WALLET.share, BASE64_BYTES, USER.sessionCookie);

    expect(resp).toStrictEqual({
      signature: SIGNATURE,
    });
    expect(ed25519SignSpy).toBeCalledTimes(1);
    expect(ed25519SignSpy).toBeCalledWith(TEST_CTX, USER.id, WALLET.id, WALLET.share, BASE64_BYTES, USER.sessionCookie);
  });

  it('openPopup throws error', async () => {
    const serverUtils = new ServerUtils();

    await expect(serverUtils.openPopup('https://test.com')).rejects.toThrow(
      'OpenPopup is not implemented in the ServerUtils class.',
    );
  });

  it('initializeWorker', async () => {
    const serverUtils = new ServerUtils();

    await serverUtils.initializeWorker(TEST_CTX);

    expect(initializeWorkerSpy).toBeCalledTimes(1);
    expect(initializeWorkerSpy).toBeCalledWith(TEST_CTX);
  });
});
