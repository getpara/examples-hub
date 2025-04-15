/* eslint-disable max-params */
import { describe, vi, expect, it, beforeAll, beforeEach } from 'vitest';

import {
  AuthInfo,
  AuthMethod,
  isVerifiedAuth,
  PregenAuth,
  PrimaryAuthInfo,
  toPregenTypeAndId,
  WalletEntity,
} from '@getpara/user-management-client';
import ParaCore, { getPublicKeyHex } from '../../src/index.js';
import { Environment, AuthStateLogin, AuthStateSignup, CoreAuthInfo, AuthState, Wallet } from '../../src/types/index.js';
import {
  API_KEY,
  PARTNER,
  USER_EMAIL,
  USER_ID,
  USER_PHONE,
  VERIFICATION_CODE,
  FARCASTER_CONNECT_URI,
  USER_FARCASTER_USERNAME,
  SESSION_LOOKUP_ID,
  USER_TELEGRAM_AUTH_OBJECT,
  EMAIL_PROPS,
  SESSION,
  USER_DISPLAY_NAME,
  USER_PFP_URL,
  USER_TELEGRAM_USER_ID,
  EXTERNAL_WALLET,
  TWOFA_URI,
  TWOFA_VERIFY_RESP,
} from '../constants';
import { MockPara } from '../mocks/mockParaCore.js';
import {
  mockSignUpOrLogIn,
  mockLoginExternalWallet,
  mockGetFarcasterAuthStatus,
  mockGetPregenWallets,
  mockGetTransmissionKeyshares,
  mockGetWallets,
  mockVerifyNewAccount,
  mockTouchSession,
  resetClientMocks,
  mockVerifyOAuth,
  mockVerifyTelegramV2,
  mockVerifyExternalWallet,
  mockSetup2FA,
  mockEnable2FA,
  mockVerify2FA,
  getVerifyState,
  getSignupState,
  getLoginState,
  mockKeepSessionAlive,
  mockGetAccountMetadata,
} from '../mocks/mockUserManagementClient';
import { getWallet, prepareMock } from '../utils.js';
import { WalletType } from '@getpara/user-management-client';
import { getWorkerContent } from '../utils.js';
import {
  mockEd25519Keygen,
  mockEd25519PreKeygen,
  mockKeygen,
  mockPreKeygen,
  mockRefresh,
  resetPlatformMocks,
} from '../mocks/mockPlatformUtils.js';
import '../mocks/mockCryptographyUtils.js';
import _ from 'lodash';
import { faker } from '@faker-js/faker';

const COMMON_SEARCH_PARAMS = {
  partnerId: PARTNER.id,
  portalAccentColor: PARTNER.accentColor,
  portalBackgroundColor: PARTNER.backgroundColor,
  portalFont: PARTNER.font,
  portalForegroundColor: PARTNER.foregroundColor,
  portalThemeMode: PARTNER.themeMode,
};

const emailAuthInfo: AuthInfo<'email'> = {
  auth: { email: USER_EMAIL },
  authType: 'email',
  identifier: USER_EMAIL,
};

const phoneAuthInfo: AuthInfo<'phone'> = {
  auth: { phone: USER_PHONE },
  authType: 'phone',
  identifier: USER_PHONE,
};

const farcasterAuthInfo: AuthInfo<'farcaster'> = {
  auth: { farcasterUsername: USER_FARCASTER_USERNAME },
  authType: 'farcaster',
  identifier: USER_FARCASTER_USERNAME,
};

const telegramAuthInfo: AuthInfo<'telegram'> = {
  auth: { telegramUserId: USER_TELEGRAM_USER_ID },
  authType: 'telegram',
  identifier: USER_TELEGRAM_USER_ID,
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

function testLoginUrl(para: MockPara, str: string, authMethod: AuthMethod) {
  const url = new URL(str);

  expect(url.origin).toEqual(PARTNER.portalUrl);
  expect(url.pathname).toEqual(authMethod === AuthMethod.PASSKEY ? '/web/biometrics/login' : '/web/passwords/login');
  expectSearchParams(url, {
    ...COMMON_SEARCH_PARAMS,
    ...para.authInfo!.auth,
    apiKey: PARTNER.apiKey!,
    encryptionKey: getPublicKeyHex(para.loginEncryptionKeyPair!),
    sessionId: SESSION_LOOKUP_ID,
    pregenIds: '{}',
  });
}

function testCreateUrl(para: MockPara, str: string, authMethod: AuthMethod) {
  const url = new URL(str);

  expect(url.origin).toEqual(PARTNER.portalUrl);
  expect(url.pathname).toEqual(
    `/web/users/${USER_ID}/${authMethod === AuthMethod.PASSKEY ? 'biometrics' : 'passwords'}/${SESSION_LOOKUP_ID}`,
  );
  expectSearchParams(url, {
    ...COMMON_SEARCH_PARAMS,
    ...para.authInfo!.auth,
    apiKey: PARTNER.apiKey,
  });
}

const initiateLogin = async (para: MockPara, authInfo: PrimaryAuthInfo): Promise<AuthStateLogin> => {
  let authState;
  switch (true) {
    case isVerifiedAuth(authInfo.auth):
      mockSignUpOrLogIn.mockResolvedValueOnce(getLoginState(authInfo.auth));

      authState = <AuthStateLogin>await para.signUpOrLogInV2({ auth: authInfo.auth });
      break;

    case authInfo.authType === 'farcaster':
      mockGetFarcasterAuthStatus.mockResolvedValue(getLoginState(farcasterAuthInfo.auth));

      authState = <AuthStateLogin>await para.verifyFarcasterV2({ onConnectUri: vi.fn() });
      break;
    case authInfo.authType === 'telegram':
      mockVerifyTelegramV2.mockResolvedValue(getLoginState(telegramAuthInfo.auth));

      authState = <AuthStateLogin>await para.verifyTelegramV2({ telegramAuthResponse: USER_TELEGRAM_AUTH_OBJECT });
      break;
  }

  testAuthInfo(para, authInfo);

  return authState;
};

const setAuthenticated = ({ evmId, solanaId }: { evmId: string; solanaId: string }) => {
  mockTouchSession.mockResolvedValue({
    ...SESSION,
    userId: USER_ID,
    isAuthenticated: true,
    currentWalletIds: { [WalletType.EVM]: [evmId], [WalletType.COSMOS]: [evmId], [WalletType.SOLANA]: [solanaId] },
    needsWallet: false,
  });
};

const testAuthInfo = async (para: MockPara, authInfo: PrimaryAuthInfo) => {
  let expectAuthInfo: CoreAuthInfo;
  switch (true) {
    case isVerifiedAuth(authInfo.auth):
      expectAuthInfo = authInfo;
      break;
    case authInfo.authType === 'farcaster':
      expectAuthInfo = {
        ...farcasterAuthInfo,
        displayName: `@${USER_FARCASTER_USERNAME}`,
        username: USER_FARCASTER_USERNAME,
        pfpUrl: USER_PFP_URL,
      };
      break;
    case authInfo.authType === 'telegram':
    default:
      expectAuthInfo = {
        ...telegramAuthInfo,
        displayName: USER_DISPLAY_NAME,
        pfpUrl: USER_PFP_URL,
        username: USER_TELEGRAM_AUTH_OBJECT.username,
      };
      break;
  }

  expect(para.userId).toEqual(USER_ID);
  expect(para.authInfo).toStrictEqual(expectAuthInfo);
};

const completeSignup = async (para: MockPara, authInfo: PrimaryAuthInfo, cancel = false) => {
  switch (true) {
    case isVerifiedAuth(authInfo.auth):
      mockSignUpOrLogIn.mockResolvedValueOnce(getVerifyState(authInfo.auth));

      await para.signUpOrLogInV2({ auth: authInfo.auth });

      mockVerifyNewAccount.mockResolvedValueOnce(getSignupState(authInfo.auth));

      await para.verifyNewAccountV2({ verificationCode: '123456' });
      break;
    case authInfo.authType === 'farcaster':
      await para.verifyFarcasterV2({ onConnectUri: vi.fn() });
      break;
    case authInfo.authType === 'telegram':
      await para.verifyTelegramV2({ telegramAuthResponse: USER_TELEGRAM_AUTH_OBJECT });
      break;
  }

  const [evmId, solanaId, evmSigner, solanaSigner] = [
    faker.string.uuid(),
    faker.string.uuid(),
    faker.string.alphanumeric(32),
    faker.string.alphanumeric(32),
  ];

  mockKeygen.mockResolvedValue({ walletId: evmId, signer: evmSigner });
  mockEd25519Keygen.mockResolvedValue({ walletId: solanaId, signer: solanaSigner });
  mockGetWallets.mockResolvedValue({
    data: {
      wallets: [getWallet({ id: evmId, type: WalletType.EVM }), getWallet({ id: solanaId, type: WalletType.SOLANA })],
    },
  });

  const cancelFn = vi.fn().mockReturnValue(cancel ? true : false);

  if (cancel) {
    expect(() => para.waitForWalletCreationV2({ isCanceled: cancelFn })).rejects.toThrow('canceled');
    throw new Error();
  } else {
    setAuthenticated({ evmId, solanaId });
  }

  const res = {
    evmId,
    solanaId,
    evmSigner,
    solanaSigner,
    result: await para.waitForWalletCreationV2({
      isCanceled: cancelFn,
    }),
  };

  return res;
};

const completeLogin = async (para: MockPara, authInfo: PrimaryAuthInfo, expectWallets?: WalletEntity[], cancel = false) => {
  await initiateLogin(para, authInfo);

  let shares: unknown[] = [],
    signers: string[] = [];

  const cancelFn = vi.fn().mockReturnValue(cancel ? true : false);

  if (cancel) {
    expect(async () => await para.waitForLoginV2({ isCanceled: cancelFn })).rejects.toThrow('canceled');
    expect(cancelFn).toHaveBeenCalled();
    throw new Error();
  }

  if (expectWallets) {
    for (const wallet of expectWallets) {
      const share = {
        walletId: wallet.id,
        encryptedShare: faker.string.alphanumeric(32),
        encryptedKey: faker.string.alphanumeric(32),
      };
      const signer = faker.string.alphanumeric(32);

      mockDecryptWithPrivateKey.mockReturnValueOnce(signer);

      shares.push(share);
      signers.push(signer);
    }

    mockGetWallets.mockResolvedValue({ data: { wallets: expectWallets } });
    mockGetTransmissionKeyshares.mockResolvedValue({
      data: { temporaryShares: shares },
    });

    setAuthenticated({ evmId: expectWallets[0].id, solanaId: expectWallets[1].id });
  }

  return { signers, shares, result: await para.waitForLoginV2({ isCanceled: cancelFn }) };
};

const createPregens = async (para: MockPara, auth: PregenAuth): Promise<Wallet[]> => {
  const [evmId, solanaId, evmSigner, solanaSigner] = [
    faker.string.uuid(),
    faker.string.uuid(),
    faker.string.alphanumeric(32),
    faker.string.alphanumeric(32),
    faker.string.alphanumeric(32),
  ];

  const wallets = [
    getWallet({ id: evmId, auth, type: WalletType.EVM }),
    getWallet({ id: solanaId, auth, type: WalletType.SOLANA }),
  ];

  mockPreKeygen.mockResolvedValue({ walletId: evmId, signer: evmSigner });
  mockEd25519PreKeygen.mockResolvedValue({ walletId: solanaId, signer: solanaSigner });
  mockGetPregenWallets.mockResolvedValue({ wallets });

  await para.createPregenWalletPerTypeV2({
    pregenId: auth,
    types: [WalletType.EVM, WalletType.SOLANA],
  });

  return wallets.map((wallet, index) => {
    switch (index) {
      case 0:
        return { ...wallet, signer: evmSigner };
      case 1:
        return { ...wallet, signer: solanaSigner };
    }
  }) as Wallet[];
};

const testInitialLogin = async (para: MockPara, authInfo: PrimaryAuthInfo, cancel = false) => {
  try {
    const { evmId, solanaId, evmSigner, solanaSigner, result } = await completeSignup(para, authInfo, cancel);

    expect(result.walletIds).toStrictEqual({
      EVM: [evmId],
      COSMOS: [evmId],
      SOLANA: [solanaId],
    });
    expect(result.recoverySecret).toEqual('recoverySecret');

    expect(mockDistributeNewShare).toHaveBeenCalledTimes(2);
    expect(mockDistributeNewShare).toHaveBeenCalledWith({
      ctx: para.ctx,
      userId: USER_ID,
      walletId: evmId,
      userShare: evmSigner,
      emailProps: EMAIL_PROPS,
    });
    expect(mockDistributeNewShare).toHaveBeenCalledWith({
      ctx: para.ctx,
      userId: USER_ID,
      walletId: solanaId,
      userShare: solanaSigner,
      emailProps: EMAIL_PROPS,
    });

    try {
      await testPostLogin(para, { evmId, solanaId, evmSigner, solanaSigner });
    } catch (e) {}
  } catch (e) {
    return;
  }
};

const testReturningLogin = async (para: MockPara, authInfo: PrimaryAuthInfo, cancel = false) => {
  const evmWallet = getWallet({ type: WalletType.EVM });
  const solanaWallet = getWallet({ type: WalletType.SOLANA });

  try {
    const { signers } = await completeLogin(para, authInfo, [evmWallet, solanaWallet], cancel);

    testPostLogin(para, {
      evmId: evmWallet.id,
      solanaId: solanaWallet.id,
      evmSigner: signers[0],
      solanaSigner: signers[1],
    });
  } catch (e) {
    return;
  }
};

const testPostLogin = async (
  para: ParaCore,
  {
    evmId,
    solanaId,
    evmSigner,
    solanaSigner,
  }: {
    evmId: string;
    solanaId: string;
    evmSigner: string;
    solanaSigner: string;
  },
) => {
  const isFullyLoggedIn = await para.isFullyLoggedIn();

  expect(isFullyLoggedIn).toBeTruthy();

  expect(para.currentWalletIds).toMatchObject({
    COSMOS: [evmId],
    SOLANA: [solanaId],
  });

  expect(para.wallets[evmId]).toBeDefined();
  expect(para.wallets[evmId].signer).toEqual(evmSigner);

  expect(para.wallets[solanaId]).toBeDefined();
  expect(para.wallets[solanaId].signer).toEqual(solanaSigner);
};

const testPregenLogin = async (
  para: MockPara,
  authInfo: AuthInfo<'email' | 'phone' | 'farcaster' | 'telegram'>,
  cancel = false,
) => {
  const [pregenIdentifierType, pregenIdentifier] = toPregenTypeAndId(authInfo.auth);

  const pregens = await createPregens(para, authInfo.auth);

  pregens.forEach(({ id, signer }) => {
    expect(para.wallets[id]).toBeDefined();
    expect(para.wallets[id]).toMatchObject({
      signer,
      isPregen: true,
      pregenIdentifier,
      pregenIdentifierType,
    });
  });

  const refreshedEvmSigner = faker.string.alphanumeric(32);

  mockRefresh.mockResolvedValue({ signer: refreshedEvmSigner, protocolId: 'protocolId' });
  mockGetWallets.mockResolvedValue({ data: { wallets: [] } });
  mockGetTransmissionKeyshares.mockResolvedValue({ data: { temporaryShares: [] } });

  try {
    await completeLogin(para, authInfo, undefined, cancel);

    setAuthenticated({ evmId: pregens[0].id, solanaId: pregens[1].id });

    pregens.forEach(({ id, signer }) => {
      expect(para.wallets[id]).toBeDefined();
      expect(para.wallets[id]).toMatchObject({
        signer: id === pregens[0].id ? refreshedEvmSigner : signer,
        isPregen: true,
        pregenIdentifier: undefined,
        pregenIdentifierType: undefined,
      });
    });
  } catch (e) {}
};

vi.mock('../../src/cryptography/utils', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    decryptWithPrivateKey: vi.fn(),
  };
});

const { mockDecryptWithPrivateKey } = vi.hoisted(() => {
  return { mockDecryptWithPrivateKey: vi.fn() };
});

vi.mock('../../src/cryptography/utils', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    decryptWithPrivateKey: mockDecryptWithPrivateKey,
  };
});

const { mockDistributeNewShare } = vi.hoisted(() => {
  return { mockDistributeNewShare: vi.fn().mockResolvedValue('recoverySecret') };
});

vi.mock('../../src/shares/shareDistribution', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    distributeNewShare: mockDistributeNewShare,
  };
});

describe('ParaCore - authentication', () => {
  let para: MockPara;

  beforeAll(async () => {
    const workerFileContent = await getWorkerContent();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(workerFileContent),
      } as Response),
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
    resetClientMocks();
    resetPlatformMocks();
  });

  describe('verified auth flows', () => {
    const testAuthFlow = (authInfo: AuthInfo<'email'> | AuthInfo<'phone'>, isNativePasskey = false) => {
      const auth = authInfo.auth;

      describe('sign up or log in', () => {
        beforeEach(() => {
          para = new MockPara(Environment.DEV, API_KEY);
          (para as unknown as any).isNativePasskey = isNativePasskey;
        });

        it('new user', async () => {
          if (para) (para as unknown as any).isNativePasskey = isNativePasskey;

          mockSignUpOrLogIn.mockResolvedValueOnce(getVerifyState(auth));

          const authState = await para.signUpOrLogInV2({ auth });

          expect(mockSignUpOrLogIn).toHaveBeenCalledWith(auth);

          expect(para.userId).toEqual(USER_ID);
          expect(para.authInfo).toStrictEqual(authInfo);
          expect(authState).toStrictEqual(getVerifyState(auth));
        });

        it('returning user', async () => {
          if (para) (para as unknown as any).isNativePasskey = isNativePasskey;

          mockSignUpOrLogIn.mockResolvedValueOnce(getLoginState(auth));

          const authState = await initiateLogin(para, authInfo);

          expect(mockSignUpOrLogIn).toHaveBeenCalledWith(auth);

          expect(para.userId).toEqual(USER_ID);
          expect(para.authInfo).toStrictEqual(authInfo);
          expect(para.loginEncryptionKeyPair).toBeDefined();

          expect(authState).toStrictEqual({
            ..._.omit(getLoginState(auth), 'loginAuthMethods'),
            ...(isNativePasskey
              ? {}
              : {
                  passkeyUrl: expect.stringMatching(''),
                  passkeyKnownDeviceUrl: expect.stringMatching(''),
                }),
            passwordUrl: expect.stringMatching(''),
          });

          if (!isNativePasskey) {
            testLoginUrl(para, authState.passkeyUrl!, AuthMethod.PASSKEY);
          }

          testLoginUrl(para, authState.passwordUrl!, AuthMethod.PASSWORD);
        });
      });

      describe('verify', () => {
        beforeEach(() => {
          para = new MockPara(Environment.DEV, API_KEY);
          (para as unknown as any).isNativePasskey = isNativePasskey;
        });

        it('invalid auth', async () => {
          if (para) (para as unknown as any).isNativePasskey = isNativePasskey;

          await para.signUpOrLogInV2({ auth });

          await para.setAuth({ telegramUserId: USER_TELEGRAM_USER_ID });

          expect(() => para.verifyNewAccountV2({ verificationCode: VERIFICATION_CODE })).rejects.toThrow(
            'invalid auth type, expected email, phone',
          );
        });
        it('failure', async () => {
          if (para) (para as unknown as any).isNativePasskey = isNativePasskey;

          await para.signUpOrLogInV2({ auth });

          mockVerifyNewAccount.mockRejectedValueOnce('invalid');

          expect(() => para.verifyNewAccountV2({ verificationCode: VERIFICATION_CODE })).rejects.toThrow('invalid');
        });
        it('success', async () => {
          if (para) (para as unknown as any).isNativePasskey = isNativePasskey;

          mockVerifyNewAccount.mockResolvedValueOnce(getSignupState(auth));
          await para.signUpOrLogInV2({ auth });

          const signupState = await para.verifyNewAccountV2({ verificationCode: VERIFICATION_CODE });

          expect(signupState).toStrictEqual({
            ..._.omit(getSignupState(auth), ['signupAuthMethods']),
            passkeyId: expect.any(String),
            ...(isNativePasskey
              ? {}
              : {
                  passkeyUrl: expect.stringMatching(''),
                }),
            passwordId: expect.any(String),
            passwordUrl: expect.stringMatching(''),
          });

          if (!isNativePasskey) {
            testCreateUrl(para, signupState.passkeyUrl!, AuthMethod.PASSKEY);
          }
          testCreateUrl(para, signupState.passwordUrl!, AuthMethod.PASSWORD);
        });
      });

      describe('login', () => {
        beforeEach(() => {
          para = new MockPara(Environment.DEV, API_KEY);
          (para as unknown as any).isNativePasskey = isNativePasskey;
        });

        describe('initial', async () => {
          it('cancels', async () => {
            await testInitialLogin(para, authInfo, true);
          });

          it('completes', async () => {
            await testInitialLogin(para, authInfo);
          });
        });

        describe('returning', async () => {
          it('cancels', async () => {
            await testReturningLogin(para, authInfo, true);
          });

          it('completes', async () => {
            await testReturningLogin(para, authInfo);
          });
        });

        describe('with pregen wallets', () => {
          it('cancels', async () => {
            await testPregenLogin(para, authInfo, true);
          });

          it('completes', async () => {
            await testPregenLogin(para, authInfo);
          });
        });
      });

      describe('2FA', () => {
        beforeEach(() => {
          para = new MockPara(Environment.DEV, API_KEY);
        });

        describe('setup2faV2', () => {
          it('no userId', async () => {
            expect(() => para.setup2faV2()).rejects.toThrow();
          });

          it('initial', async () => {
            await prepareMock(para, { auth });

            mockSetup2FA.mockResolvedValueOnce({ isSetup: false, uri: TWOFA_URI });

            const res = await para.setup2faV2();
            expect(res).toStrictEqual({ isSetup: false, uri: TWOFA_URI });
          });

          it('already setup', async () => {
            await prepareMock(para, { auth });

            mockSetup2FA.mockResolvedValueOnce({ isSetup: true });

            const res = await para.setup2faV2();
            expect(res).toStrictEqual({ isSetup: true });
          });
        });

        describe('enable2faV2', () => {
          it('no userId', async () => {
            expect(() => para.enable2faV2({ verificationCode: VERIFICATION_CODE })).rejects.toThrow();
          });

          it('success', async () => {
            await prepareMock(para, { auth });

            await para.enable2faV2({ verificationCode: VERIFICATION_CODE });

            expect(mockEnable2FA).toHaveBeenCalledWith(USER_ID, VERIFICATION_CODE);
          });
        });

        it('verify2faV2', async () => {
          await prepareMock(para, { auth });

          const res = await para.verify2faV2({ auth, verificationCode: VERIFICATION_CODE });

          expect(mockVerify2FA).toHaveBeenCalledWith(auth, VERIFICATION_CODE);
          expect(res).toEqual(TWOFA_VERIFY_RESP);
        });
      });

      it('logout', async () => {
        await initiateLogin(para, authInfo);

        await para.logout();

        expect(para.userId).toBeUndefined();
        expect(para.authInfo).toBeUndefined();
      });
    };

    [false, true].forEach(isNativePasskey => {
      describe(isNativePasskey ? 'with native passkeys' : 'without native passkeys', () => {
        describe('email', () => {
          testAuthFlow(emailAuthInfo, isNativePasskey);
        });

        describe('phone', () => {
          testAuthFlow(phoneAuthInfo, isNativePasskey);
        });
      });
    });
  });

  describe('third-party auth flows', () => {
    beforeEach(() => {
      para = new MockPara(Environment.DEV, API_KEY);
      resetClientMocks();
      resetPlatformMocks();
    });

    describe('oauth', () => {
      describe('verify', () => {
        [false, true].forEach(withCallback => {
          describe(withCallback ? 'with onOAuthUrl' : 'without onOAuthUrl', () => {
            const prepare = async (method: Parameters<typeof para.verifyOAuthV2>[0]['method']) => {
              let url: URL, authState: AuthState;
              if (withCallback) {
                const onOAuthUrl = vi.fn();

                authState = await para.verifyOAuthV2({
                  method,
                  onOAuthUrl,
                });

                expect(onOAuthUrl).toHaveBeenCalledOnce();
                expect(onOAuthUrl).toHaveBeenCalledWith(expect.stringContaining(''));

                const oAuthUrl = onOAuthUrl.mock.calls[0][0];
                url = new URL(oAuthUrl);
              } else {
                const oAuthUrl = await para.getOAuthUrlV2({ method });

                authState = await para.verifyOAuthV2({ method });

                url = new URL(oAuthUrl);
              }

              expect(url.origin).toEqual('http://localhost:8080');
              expect(url.pathname).toEqual(`/auth/${method}`);
              expectSearchParams(url, {
                apiKey: PARTNER.apiKey,
                sessionLookupId: SESSION_LOOKUP_ID,
              });

              testAuthInfo(para, emailAuthInfo);

              return authState;
            };

            ['google', 'apple', 'facebook', 'discord', 'twitter'].forEach(method => {
              describe(method, async () => {
                it('new user', async () => {
                  const authState = await prepare(method as any);

                  expect(authState).toStrictEqual({
                    ..._.omit(getSignupState(emailAuthInfo.auth), 'signupAuthMethods'),
                    passkeyId: expect.any(String),
                    passkeyUrl: expect.stringMatching(''),
                    passwordId: expect.any(String),
                    passwordUrl: expect.stringMatching(''),
                  });

                  testCreateUrl(para, authState.passkeyUrl!, AuthMethod.PASSKEY);
                  testCreateUrl(para, authState.passwordUrl!, AuthMethod.PASSWORD);
                });

                it('returning user', async () => {
                  mockVerifyOAuth.mockResolvedValueOnce(getLoginState(emailAuthInfo.auth));

                  const authState = await prepare(method as any);

                  expect(para.loginEncryptionKeyPair).toBeDefined();
                  expect(authState).toStrictEqual({
                    ..._.omit(getLoginState(emailAuthInfo.auth), 'loginAuthMethods'),
                    passkeyUrl: expect.stringMatching(''),
                    passkeyKnownDeviceUrl: expect.stringMatching(''),
                    passwordUrl: expect.stringMatching(''),
                  });

                  testLoginUrl(para, authState.passkeyUrl!, AuthMethod.PASSKEY);
                  testLoginUrl(para, authState.passwordUrl!, AuthMethod.PASSWORD);
                });
              });
            });
          });
        });
      });
    });

    [farcasterAuthInfo, telegramAuthInfo].forEach(authInfo => {
      describe(authInfo.authType, () => {
        describe('verify', () => {
          const prepare = async <T extends AuthState>(): Promise<T> => {
            let authState;
            switch (authInfo.authType) {
              case 'farcaster':
                {
                  const onConnectUri = vi.fn();

                  authState = await para.verifyFarcasterV2({
                    onConnectUri,
                  });

                  expect(onConnectUri).toHaveBeenCalledOnce();
                  expect(onConnectUri).toHaveBeenCalledWith(FARCASTER_CONNECT_URI);
                }
                break;
              case 'telegram':
                {
                  authState = await para.verifyTelegramV2({
                    telegramAuthResponse: USER_TELEGRAM_AUTH_OBJECT,
                  });
                }
                break;
            }

            return authState as T;
          };

          it('new user', async () => {
            const authState = await prepare<AuthStateSignup>();

            expect(authState).toStrictEqual({
              ..._.omit(getSignupState(authInfo.auth), 'signupAuthMethods'),
              passkeyId: expect.stringMatching(''),
              passkeyUrl: expect.stringMatching(''),
              passwordId: expect.stringMatching(''),
              passwordUrl: expect.stringMatching(''),
            });

            testCreateUrl(para, authState.passkeyUrl!, AuthMethod.PASSKEY);
            testCreateUrl(para, authState.passwordUrl!, AuthMethod.PASSWORD);
          });

          it('returning user', async () => {
            switch (authInfo.authType) {
              case 'farcaster':
                mockGetFarcasterAuthStatus.mockResolvedValue(getLoginState(farcasterAuthInfo.auth));
                break;
              case 'telegram':
                mockVerifyTelegramV2.mockResolvedValue(getLoginState(telegramAuthInfo.auth));
                break;
            }

            const authState = await prepare<AuthStateLogin>();

            expect(para.loginEncryptionKeyPair).toBeDefined();
            expect(authState).toStrictEqual({
              ..._.omit(getLoginState(authInfo.auth), 'loginAuthMethods'),
              passkeyUrl: expect.stringMatching(''),
              passkeyKnownDeviceUrl: expect.stringMatching(''),
              passwordUrl: expect.stringMatching(''),
            });

            testLoginUrl(para, authState.passkeyUrl!, AuthMethod.PASSKEY);
            testLoginUrl(para, authState.passwordUrl!, AuthMethod.PASSWORD);
          });
        });

        describe('login', () => {
          describe('initial', async () => {
            it('cancels', async () => {
              await testInitialLogin(para, authInfo, true);
            });

            it('completes', async () => {
              await testInitialLogin(para, authInfo);
            });
          });

          describe('returning', async () => {
            it('cancels', async () => {
              await testReturningLogin(para, authInfo, true);
            });

            it('completes', async () => {
              await testReturningLogin(para, authInfo);
            });
          });

          it('with pregen wallets', async () => {
            await testPregenLogin(para, authInfo);
          });
        });

        it('logout', async () => {
          para = new MockPara(Environment.DEV, API_KEY);

          await initiateLogin(para, authInfo);

          await para.logout();

          expect(para.userId).toBeUndefined();
          expect(para.authInfo).toBeUndefined();
        });
      });
    });
  });

  describe('external wallets', () => {
    beforeEach(async () => {
      para = new MockPara(Environment.DEV, API_KEY);
    });

    describe('login', () => {
      it('new user', async () => {
        mockLoginExternalWallet.mockResolvedValueOnce(getVerifyState({ externalWalletAddress: EXTERNAL_WALLET.address }));
        const authState = await para.loginExternalWalletV2({
          externalWallet: EXTERNAL_WALLET,
        });

        expect(authState).toStrictEqual(getVerifyState({ externalWalletAddress: EXTERNAL_WALLET.address }));
      });

      it('returning user', async () => {
        mockLoginExternalWallet.mockResolvedValueOnce(getLoginState({ externalWalletAddress: EXTERNAL_WALLET.address }));

        const authState = (await para.loginExternalWalletV2({
          externalWallet: EXTERNAL_WALLET,
        })) as AuthStateLogin;

        expect(authState).toStrictEqual({
          ..._.omit(getLoginState({ externalWalletAddress: EXTERNAL_WALLET.address }), 'loginAuthMethods'),
          passkeyUrl: expect.stringMatching(''),
          passkeyKnownDeviceUrl: expect.stringMatching(''),
          passwordUrl: expect.stringMatching(''),
        });

        testLoginUrl(para, authState.passkeyUrl!, AuthMethod.PASSKEY);
        testLoginUrl(para, authState.passwordUrl!, AuthMethod.PASSWORD);
      });
    });

    it('verify', async () => {
      mockVerifyExternalWallet.mockResolvedValueOnce(getSignupState({ externalWalletAddress: EXTERNAL_WALLET.address }));

      const authState = await para.verifyExternalWalletV2({
        externalWallet: EXTERNAL_WALLET,
        signedMessage: 'signedMessage',
        cosmosPublicKeyHex: 'cosmosPublicKeyHex',
        cosmosSigner: 'cosmosSigner',
      });

      expect(authState).toStrictEqual({
        ..._.omit(getSignupState({ externalWalletAddress: EXTERNAL_WALLET.address }), 'signupAuthMethods'),
        passkeyId: expect.stringMatching(''),
        passwordId: expect.stringMatching(''),
        passkeyUrl: expect.stringMatching(''),
        passwordUrl: expect.stringMatching(''),
      });

      testCreateUrl(para, authState.passkeyUrl!, AuthMethod.PASSKEY);
      testCreateUrl(para, authState.passwordUrl!, AuthMethod.PASSWORD);
    });

    it('logout', async () => {
      const { address, type, provider } = EXTERNAL_WALLET;

      await para.loginExternalWalletV2({ externalWallet: { address, type, provider } });

      await para.logout();

      expect(para.externalWallets).toEqual({});
    });
  });
  describe('helpers', () => {
    describe('account metadata', () => {
      it('fails with no session', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);

        mockTouchSession.mockResolvedValueOnce({
          isAuthenticated: false,
          partnerId: PARTNER.id,
          supportedWalletTypes: [],
        });

        await expect(para.getAccountMetadata()).rejects.toThrowError();
      });

      it('retrieves account metadata', async () => {
        const para = new MockPara(Environment.DEV, API_KEY);
        await para.setUserId(USER_ID);

        mockGetAccountMetadata.mockResolvedValueOnce({ accountMetadata: { google: 'any' } });
        const res = await para.getAccountMetadata();

        expect(mockGetAccountMetadata).toHaveBeenCalledWith(USER_ID, PARTNER.id);
        expect(res).toEqual({ google: 'any' });
      });
    });
    it('keepSessionAlive', async () => {
      para = new MockPara(Environment.DEV, API_KEY);

      let isAlive = await para.keepSessionAlive();

      expect(isAlive).toEqual(true);

      mockKeepSessionAlive.mockRejectedValueOnce('error');

      isAlive = await para.keepSessionAlive();

      expect(isAlive).toEqual(false);
    });
    it('getVerificationToken', async () => {
      para = new MockPara(Environment.DEV, API_KEY);

      const verificationToken = await para.getVerificationToken();
      expect(verificationToken).toEqual(SESSION_LOOKUP_ID);
    });

    it('auth setters', async () => {
      para = new MockPara(Environment.DEV, API_KEY);

      await para.setUserId(USER_ID);
      expect(para.userId).toEqual(USER_ID);
      expect(para.getUserId()).toEqual(USER_ID);

      await para.setEmail(USER_EMAIL);
      expect(para.email).toEqual(USER_EMAIL);
      expect(para.getEmail()).toEqual(USER_EMAIL);

      await para.setPhoneNumber(USER_PHONE);
      expect(para.phone).toEqual(USER_PHONE);
      expect(para.getPhoneNumber()).toEqual(USER_PHONE);

      await para.setFarcasterUsername(USER_FARCASTER_USERNAME);
      expect(para.farcasterUsername).toEqual(USER_FARCASTER_USERNAME);
      expect(para.getFarcasterUsername()).toEqual(USER_FARCASTER_USERNAME);

      await para.setTelegramUserId(USER_TELEGRAM_USER_ID);
      expect(para.telegramUserId).toEqual(USER_TELEGRAM_USER_ID);
    });
  });
});
