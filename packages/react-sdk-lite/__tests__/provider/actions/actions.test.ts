import { CoreMethodName, CoreMethodParams, Environment } from '@getpara/web-sdk';
import * as actions from '../../../src/provider/actions/index.js';
import { CoreAction } from '../../../src/provider/actions/utils.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MockPara } from '../../mocks/mockCorePara.js';
import { API_KEY } from '../../constants.js';

const emailAuth = { email: 'email@test.com' };

const para = new MockPara(Environment.DEV, API_KEY);

type TestSuites = Partial<{
  [key in CoreMethodName]: {
    action: CoreAction<key>;
    args: CoreMethodParams<key>;
  };
}>;

const testSuites: TestSuites = {
  signUpOrLogIn: {
    action: actions.signUpOrLogIn,
    args: { auth: emailAuth },
  },
  verifyNewAccount: {
    action: actions.verifyNewAccount,
    args: { verificationCode: '123456' },
  },
  waitForLogin: {
    action: actions.waitForLogin,
    args: { isCanceled: () => true },
  },
  waitForSignup: {
    action: actions.waitForSignup,
    args: { isCanceled: () => true },
  },
  waitForWalletCreation: {
    action: actions.waitForWalletCreation,
    args: { isCanceled: () => true },
  },
  verifyOAuth: {
    action: actions.verifyOAuth,
    args: { method: 'GOOGLE', isCanceled: () => true },
  },
  verifyFarcaster: {
    action: actions.verifyFarcaster,
    args: { onConnectUri: () => {}, isCanceled: () => true },
  },
  verifyTelegram: {
    action: actions.verifyTelegram,
    args: { telegramAuthResponse: {} as any },
  },
  loginExternalWallet: {
    action: actions.loginExternalWallet,
    args: { externalWallet: {} as any },
  },
  verifyExternalWallet: {
    action: actions.verifyExternalWallet,
    args: { externalWallet: {} as any, signedMessage: 'signedMessage' },
  },
  setup2fa: {
    action: actions.setup2fa,
    args: undefined,
  },
  enable2fa: {
    action: actions.enable2fa,
    args: { verificationCode: '123456' },
  },
  verify2fa: {
    action: actions.verify2fa,
    args: { auth: emailAuth, verificationCode: '123456' },
  },
  keepSessionAlive: {
    action: actions.keepSessionAlive,
    args: undefined,
  },
  logout: {
    action: actions.logout,
    args: { clearPregenWallets: true },
  },
  resendVerificationCode: {
    action: actions.resendVerificationCode,
    args: undefined,
  },
  createWallet: {
    action: actions.createWallet,
    args: { type: 'EVM' },
  },
  createWalletPerType: {
    action: actions.createWalletPerType,
    args: { types: ['EVM'] },
  },
  createPregenWallet: {
    action: actions.createPregenWallet,
    args: { pregenId: emailAuth, type: 'EVM' },
  },
  createPregenWalletPerType: {
    action: actions.createPregenWalletPerType,
    args: { pregenId: emailAuth, types: ['EVM'] },
  },
  claimPregenWallets: {
    action: actions.claimPregenWallets,
    args: { pregenId: emailAuth },
  },
  hasPregenWallet: {
    action: actions.hasPregenWallet,
    args: { pregenId: emailAuth },
  },
  updatePregenWalletIdentifier: {
    action: actions.updatePregenWalletIdentifier,
    args: { newPregenId: emailAuth, walletId: 'walletId' },
  },
  signMessage: {
    action: actions.signMessage,
    args: { walletId: 'walletId', messageBase64: 'message' },
  },
  signTransaction: {
    action: actions.signTransaction,
    args: { walletId: 'walletId', chainId: '1', rlpEncodedTxBase64: 'transaction' },
  },
  createGuestWallets: {
    action: actions.createGuestWallets,
    args: undefined,
  },
  addCredential: {
    action: actions.addCredential,
    args: undefined,
  },
};

describe('actions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  Object.entries(testSuites).forEach(
    <const key extends CoreMethodName>([key, { action, args }]: [
      CoreMethodName,
      {
        action: CoreAction<key>;
        args: CoreMethodParams<key>;
        isOptionalArgs?: boolean;
      },
    ]) => {
      describe(key, () => {
        it('success', async () => {
          await action(para, args as CoreMethodParams<key>);

          expect(para[key]).toHaveBeenCalledTimes(1);
          expect(para[key]).toHaveBeenCalledWith(args);
        });
        describe('fail', () => {
          it('no para', async () => {
            expect(action(undefined, undefined)).rejects.toThrowError();
          });
        });
      });
    },
  );
});
