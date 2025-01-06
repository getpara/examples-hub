import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { WebUtils } from '../src/WebUtils.js';
import * as privateKey from '../src/wallet/privateKey.js';
import {
  BASE64_BYTES,
  CHAIN,
  COSMOS_SIGN_DOC,
  MESSAGE,
  PARTNER,
  SECRET_KEY,
  SIGNATURE,
  TX,
  USER,
  WALLET,
  WINDOW_INNER_HEIGHT,
  WINDOW_INNER_WIDTH,
} from './constants.js';
import { documentElementMockValue, mockWindowOpen, TEST_CTX, windowMockValue } from './setup.js';
import { WalletType } from '@usecapsule/user-management-client';
import * as keygen from '../src/wallet/keygen.js';
import * as signing from '../src/wallet/signing.js';
import { LocalStorage } from '../src/LocalStorage.js';
import { SessionStorage } from '../src/SessionStorage.js';
import { PopupType } from '@usecapsule/core-sdk';

const TEST_POPUP_URL = 'https://test.com';

const getPrivateKeySpy = vi.spyOn(privateKey, 'getPrivateKey').mockImplementation(async () => WALLET.privateKey);
const keygenSpy = vi.spyOn(keygen, 'keygen').mockImplementation(async () => ({
  signer: WALLET.signer,
  walletId: WALLET.id,
  recoveryShare: WALLET.share,
}));
const refreshSpy = vi.spyOn(keygen, 'refresh').mockImplementation(async () => ({
  signer: WALLET.signer,
}));
const preKeygenSpy = vi.spyOn(keygen, 'preKeygen').mockImplementation(async () => ({
  signer: WALLET.signer,
  walletId: WALLET.id,
  recoveryShare: WALLET.share,
}));
const ed25519KeygenSpy = vi.spyOn(keygen, 'ed25519Keygen').mockImplementation(async () => ({
  signer: WALLET.signer,
  walletId: WALLET.id,
  recoveryShare: WALLET.share,
}));
const ed25519PreKeygenSpy = vi.spyOn(keygen, 'ed25519PreKeygen').mockImplementation(async () => ({
  signer: WALLET.signer,
  walletId: WALLET.id,
  recoveryShare: WALLET.share,
}));

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

let popUpHeight = 0;
let popUpWidth = 550;

describe('WebUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('constructor', () => {
    const webUtils = new WebUtils();

    expect(webUtils).toBeInstanceOf(WebUtils);
  });
  it('getPrivateKey', async () => {
    const webUtils = new WebUtils();

    const resp = await webUtils.getPrivateKey(TEST_CTX, USER.id, WALLET.id, WALLET.share, USER.sessionCookie);

    expect(resp).toBe(WALLET.privateKey);
    expect(getPrivateKeySpy).toBeCalledTimes(1);
    expect(getPrivateKeySpy).toBeCalledWith(TEST_CTX, USER.id, WALLET.id, WALLET.share, USER.sessionCookie);
  });
  it('keygen', async () => {
    const webUtils = new WebUtils();

    const resp = await webUtils.keygen(TEST_CTX, USER.id, WalletType.EVM, SECRET_KEY, USER.sessionCookie);

    expect(resp).toStrictEqual({
      signer: WALLET.signer,
      walletId: WALLET.id,
      recoveryShare: WALLET.share,
    });
    expect(keygenSpy).toBeCalledTimes(1);
    expect(keygenSpy).toBeCalledWith(TEST_CTX, USER.id, WalletType.EVM, SECRET_KEY, true, USER.sessionCookie, {});
  });
  it('refresh', async () => {
    const webUtils = new WebUtils();

    const resp = await webUtils.refresh(
      TEST_CTX,
      USER.sessionCookie,
      USER.id,
      WALLET.id,
      WALLET.share,
      PARTNER.id,
      PARTNER.id,
    );

    expect(resp).toStrictEqual({
      signer: WALLET.signer,
    });
    expect(refreshSpy).toBeCalledTimes(1);
    expect(refreshSpy).toBeCalledWith(
      TEST_CTX,
      USER.sessionCookie,
      USER.id,
      WALLET.id,
      WALLET.share,
      PARTNER.id,
      PARTNER.id,
    );
  });
  it('preKeygen', async () => {
    const webUtils = new WebUtils();

    const resp = await webUtils.preKeygen(
      TEST_CTX,
      PARTNER.id,
      USER.email,
      'EMAIL',
      WalletType.EVM,
      SECRET_KEY,
      USER.sessionCookie,
    );

    expect(resp).toStrictEqual({
      signer: WALLET.signer,
      walletId: WALLET.id,
      recoveryShare: WALLET.share,
    });
    expect(preKeygenSpy).toBeCalledTimes(1);
    expect(preKeygenSpy).toBeCalledWith(
      TEST_CTX,
      USER.email,
      'EMAIL',
      WalletType.EVM,
      SECRET_KEY,
      false,
      PARTNER.id,
      USER.sessionCookie,
    );
  });
  it('signMessage', async () => {
    const webUtils = new WebUtils();

    const resp = await webUtils.signMessage(
      TEST_CTX,
      USER.id,
      WALLET.id,
      WALLET.share,
      MESSAGE,
      USER.sessionCookie,
      true,
      COSMOS_SIGN_DOC,
    );

    expect(resp).toStrictEqual({
      signature: SIGNATURE,
    });
    expect(signMessageSpy).toBeCalledTimes(1);
    expect(signMessageSpy).toBeCalledWith(
      TEST_CTX,
      USER.id,
      WALLET.id,
      WALLET.share,
      MESSAGE,
      USER.sessionCookie,
      true,
      COSMOS_SIGN_DOC,
    );
  });
  it('signTransaction', async () => {
    const webUtils = new WebUtils();

    const resp = await webUtils.signTransaction(
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
    const webUtils = new WebUtils();

    const resp = await webUtils.sendTransaction(
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
  it('signHash', async () => {
    const webUtils = new WebUtils();

    expect(() => webUtils.signHash('', '')).toThrowError('not implemented');
  });
  it('ed25519Keygen', async () => {
    const webUtils = new WebUtils();

    const resp = await webUtils.ed25519Keygen(TEST_CTX, USER.id, USER.sessionCookie);

    expect(resp).toStrictEqual({
      signer: WALLET.signer,
      walletId: WALLET.id,
      recoveryShare: WALLET.share,
    });
    expect(ed25519KeygenSpy).toBeCalledTimes(1);
    expect(ed25519KeygenSpy).toBeCalledWith(TEST_CTX, USER.id, USER.sessionCookie, undefined);
  });
  it('ed25519PreKeygen', async () => {
    const webUtils = new WebUtils();

    const resp = await webUtils.ed25519PreKeygen(TEST_CTX, USER.email, 'EMAIL', USER.sessionCookie);

    expect(resp).toStrictEqual({
      signer: WALLET.signer,
      walletId: WALLET.id,
      recoveryShare: WALLET.share,
    });
    expect(ed25519PreKeygenSpy).toBeCalledTimes(1);
    expect(ed25519PreKeygenSpy).toBeCalledWith(TEST_CTX, USER.email, 'EMAIL', USER.sessionCookie);
  });
  it('ed25519Sign', async () => {
    const webUtils = new WebUtils();

    const resp = await webUtils.ed25519Sign(TEST_CTX, USER.id, WALLET.id, WALLET.share, BASE64_BYTES, USER.sessionCookie);

    expect(resp).toStrictEqual({
      signature: SIGNATURE,
    });
    expect(ed25519SignSpy).toBeCalledTimes(1);
    expect(ed25519SignSpy).toBeCalledWith(TEST_CTX, USER.id, WALLET.id, WALLET.share, BASE64_BYTES, USER.sessionCookie);
  });
  it('localStorage', async () => {
    const webUtils = new WebUtils();

    expect(webUtils.localStorage).toBeInstanceOf(LocalStorage);
  });
  it('sessionStorage', async () => {
    const webUtils = new WebUtils();

    expect(webUtils.sessionStorage).toBeInstanceOf(SessionStorage);
  });
  it('secureStorage', async () => {
    const webUtils = new WebUtils();

    expect(webUtils.secureStorage).toBeNull();
  });
  it('isSyncStorage', async () => {
    const webUtils = new WebUtils();

    expect(webUtils.isSyncStorage).toBeTruthy();
  });
  it('disableProviderModal', async () => {
    const webUtils = new WebUtils();

    expect(webUtils.disableProviderModal).toBeFalsy();
  });
  describe('openPopup', () => {
    describe('no type', () => {
      it('no delay', () => {
        const webUtils = new WebUtils();

        const resp = webUtils.openPopup(TEST_POPUP_URL);

        expect(resp.location.href).toBe(TEST_POPUP_URL);
        expect(mockWindowOpen).toBeCalledTimes(1);
        expect(mockWindowOpen).toBeCalledWith(TEST_POPUP_URL, 'popup', 'popup=true,width=400,height=500');
      });
      it('delay', () => {
        mockWindowOpen.mockReturnValueOnce(undefined as any);
        const webUtils = new WebUtils();

        const resp = webUtils.openPopup(TEST_POPUP_URL);

        vi.advanceTimersByTime(1000);

        expect(resp).toBeUndefined();
        expect(mockWindowOpen).toBeCalledTimes(2);
        expect(mockWindowOpen).toBeCalledWith(TEST_POPUP_URL, 'popup', 'popup=true,width=400,height=500');
        expect(mockWindowOpen).toBeCalledWith(TEST_POPUP_URL, '_blank');
      });
    });
    describe('LOGIN_PASSKEY', () => {
      it('no delay', () => {
        const webUtils = new WebUtils();

        const resp = webUtils.openPopup(TEST_POPUP_URL, {
          type: PopupType.LOGIN_PASSKEY,
        });
        popUpHeight = 798;

        expect(resp.location.href).toBe(TEST_POPUP_URL);
        expect(mockWindowOpen).toBeCalledTimes(1);
        expect(mockWindowOpen).toBeCalledWith(
          TEST_POPUP_URL,
          PopupType.LOGIN_PASSKEY.toString(),
          `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
        );
      });
      it('delay', () => {
        mockWindowOpen.mockReturnValueOnce(undefined as any);
        const webUtils = new WebUtils();

        const resp = webUtils.openPopup(TEST_POPUP_URL, {
          type: PopupType.LOGIN_PASSKEY,
        });
        popUpHeight = 798;

        vi.advanceTimersByTime(1000);

        expect(resp).toBeUndefined();
        expect(mockWindowOpen).toBeCalledTimes(2);
        expect(mockWindowOpen).toBeCalledWith(
          TEST_POPUP_URL,
          PopupType.LOGIN_PASSKEY.toString(),
          `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
        );
        expect(mockWindowOpen).toBeCalledWith(TEST_POPUP_URL, '_blank');
      });
      it('dual monitor', () => {
        Object.defineProperty(globalThis, 'window', {
          value: {
            ...windowMockValue,
            screenLeft: 100,
            screenTop: 100,
          },
          configurable: true,
        });

        const webUtils = new WebUtils();

        const resp = webUtils.openPopup(TEST_POPUP_URL, {
          type: PopupType.LOGIN_PASSKEY,
        });
        popUpHeight = 798;

        expect(resp.location.href).toBe(TEST_POPUP_URL);
        expect(mockWindowOpen).toBeCalledTimes(1);
        expect(mockWindowOpen).toBeCalledWith(
          TEST_POPUP_URL,
          PopupType.LOGIN_PASSKEY.toString(),
          `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2 + 100}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2 + 100}`,
        );

        Object.defineProperty(globalThis, 'window', {
          value: windowMockValue,
          configurable: true,
        });
      });
      it('use document', () => {
        Object.defineProperty(globalThis, 'window', {
          value: {
            ...windowMockValue,
            innerWidth: undefined,
            innerHeight: undefined,
          },
          configurable: true,
        });

        const webUtils = new WebUtils();

        const resp = webUtils.openPopup(TEST_POPUP_URL, {
          type: PopupType.LOGIN_PASSKEY,
        });
        popUpHeight = 798;

        expect(resp.location.href).toBe(TEST_POPUP_URL);
        expect(mockWindowOpen).toBeCalledTimes(1);
        expect(mockWindowOpen).toBeCalledWith(
          TEST_POPUP_URL,
          PopupType.LOGIN_PASSKEY.toString(),
          `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
        );

        Object.defineProperty(globalThis, 'window', {
          value: windowMockValue,
          configurable: true,
        });
      });
      it('use screen', () => {
        Object.defineProperty(globalThis, 'window', {
          value: {
            ...windowMockValue,
            innerWidth: undefined,
            innerHeight: undefined,
          },
          configurable: true,
        });
        Object.defineProperty(globalThis, 'document', {
          value: {
            documentElement: {
              clientWidth: undefined,
              clientHeight: undefined,
            },
          },
          configurable: true,
        });

        const webUtils = new WebUtils();

        const resp = webUtils.openPopup(TEST_POPUP_URL, {
          type: PopupType.LOGIN_PASSKEY,
        });
        popUpHeight = 798;

        expect(resp.location.href).toBe(TEST_POPUP_URL);
        expect(mockWindowOpen).toBeCalledTimes(1);
        expect(mockWindowOpen).toBeCalledWith(
          TEST_POPUP_URL,
          PopupType.LOGIN_PASSKEY.toString(),
          `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
        );

        Object.defineProperty(globalThis, 'window', {
          value: windowMockValue,
          configurable: true,
        });
        Object.defineProperty(globalThis, 'document', {
          value: { documentElement: documentElementMockValue },
          configurable: true,
        });
      });
    });
    it('LOGIN_PASSKEY', () => {
      const webUtils = new WebUtils();

      const resp = webUtils.openPopup(TEST_POPUP_URL, {
        type: PopupType.LOGIN_PASSKEY,
      });
      popUpHeight = 798;

      expect(resp.location.href).toBe(TEST_POPUP_URL);
      expect(mockWindowOpen).toBeCalledTimes(1);
      expect(mockWindowOpen).toBeCalledWith(
        TEST_POPUP_URL,
        PopupType.LOGIN_PASSKEY.toString(),
        `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
      );
    });
    it('CREATE_PASSKEY', () => {
      const webUtils = new WebUtils();

      const resp = webUtils.openPopup(TEST_POPUP_URL, {
        type: PopupType.CREATE_PASSKEY,
      });
      popUpHeight = 464;

      expect(resp.location.href).toBe(TEST_POPUP_URL);
      expect(mockWindowOpen).toBeCalledTimes(1);
      expect(mockWindowOpen).toBeCalledWith(
        TEST_POPUP_URL,
        PopupType.CREATE_PASSKEY.toString(),
        `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
      );
    });
    it('SIGN_MESSAGE_REVIEW', () => {
      const webUtils = new WebUtils();

      const resp = webUtils.openPopup(TEST_POPUP_URL, {
        type: PopupType.SIGN_MESSAGE_REVIEW,
      });
      popUpHeight = 585;

      expect(resp.location.href).toBe(TEST_POPUP_URL);
      expect(mockWindowOpen).toBeCalledTimes(1);
      expect(mockWindowOpen).toBeCalledWith(
        TEST_POPUP_URL,
        PopupType.SIGN_MESSAGE_REVIEW.toString(),
        `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
      );
    });
    it('SIGN_TRANSACTION_REVIEW', () => {
      const webUtils = new WebUtils();

      const resp = webUtils.openPopup(TEST_POPUP_URL, {
        type: PopupType.SIGN_TRANSACTION_REVIEW,
      });
      popUpHeight = 750;

      expect(resp.location.href).toBe(TEST_POPUP_URL);
      expect(mockWindowOpen).toBeCalledTimes(1);
      expect(mockWindowOpen).toBeCalledWith(
        TEST_POPUP_URL,
        PopupType.SIGN_TRANSACTION_REVIEW.toString(),
        `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
      );
    });
    it('OAUTH', () => {
      const webUtils = new WebUtils();

      const resp = webUtils.openPopup(TEST_POPUP_URL, {
        type: PopupType.OAUTH,
      });
      popUpHeight = 768;

      expect(resp.location.href).toBe(TEST_POPUP_URL);
      expect(mockWindowOpen).toBeCalledTimes(1);
      expect(mockWindowOpen).toBeCalledWith(
        TEST_POPUP_URL,
        PopupType.OAUTH.toString(),
        `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
      );
    });
  });
});
