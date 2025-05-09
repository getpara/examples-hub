import { describe, vi, afterEach, expect, it, beforeEach } from 'vitest';
import Client, { handleResponseError, handleResponseSuccess } from '../src/client';
import { AxiosError, AxiosInstance } from 'axios';
import { PARTNER_ID_HEADER_NAME, SESSION_COOKIE_HEADER_NAME } from '../src/consts';
import {
  Chain,
  EncryptorType,
  KeyShareType,
  Network,
  OnRampAsset,
  OnRampProvider,
  OnRampPurchaseType,
  PasswordStatus,
  PublicKeyStatus,
  PublicKeyType,
  TWalletScheme,
  TWalletType,
} from '../src';

const email = 'email@test.com';
const userId = 'userId';
const walletId = 'walletId';
const partnerId = 'partnerId';
const passwordId = 'passwordId';
const externalWalletAddress = 'externalWalletAddress';

const mocks = vi.hoisted(() => ({
  post: vi.fn().mockImplementation(() =>
    Promise.resolve({
      data: {},
      headers: {
        [SESSION_COOKIE_HEADER_NAME]: 'session-cookie',
      },
    }),
  ),
  get: vi.fn().mockImplementation(() =>
    Promise.resolve({
      data: {},
      headers: {
        [SESSION_COOKIE_HEADER_NAME]: 'session-cookie',
      },
    }),
  ),
  patch: vi.fn().mockImplementation(() =>
    Promise.resolve({
      data: {},
      headers: {
        [SESSION_COOKIE_HEADER_NAME]: 'session-cookie',
      },
    }),
  ),
  delete: vi.fn().mockImplementation(() =>
    Promise.resolve({
      data: {},
      headers: {
        [SESSION_COOKIE_HEADER_NAME]: 'session-cookie',
      },
    }),
  ), // and any other request type you want to mock
}));

vi.mock('axios', async importActual => {
  const actual = await importActual<typeof import('axios')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(opts => ({
        ...actual.default.create(opts),
        get: mocks.get,
        post: mocks.post,
        patch: mocks.patch,
        delete: mocks.delete,
      })),
    },
  };
});

describe('Client', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('creates a new instance of Client with correct fields', async () => {
      const opts = {
        userManagementHost: 'http://localhost:3000',
        apiKey: 'api-key',
        version: '3.0.0',
        retrieveSessionCookie: vi.fn().mockImplementation(() => 'session-cookie'),
        persistSessionCookie: vi.fn().mockImplementation(() => Promise.resolve(true)),
      };

      const client = new Client(opts);

      const baseRequest = (client as unknown as any).baseRequest as AxiosInstance;

      expect(baseRequest.defaults.baseURL).toEqual(opts.userManagementHost);
      expect(baseRequest.defaults.withCredentials).toEqual(true);
      expect(baseRequest.defaults.headers['X-External-API-Key']).toEqual(opts.apiKey);
    });
  });

  describe('response handlers', () => {
    describe('success handler', () => {
      it('success', async () => {
        const resp = handleResponseSuccess({
          data: { test: 'test' },
          status: 200,
          statusText: '',
          headers: undefined,
          config: undefined,
        });

        expect(resp.data).toStrictEqual({ test: 'test' });
      });
      it('fail - not 200 status', async () => {
        expect(() =>
          handleResponseSuccess({
            data: undefined,
            status: 400,
            statusText: '',
            headers: undefined,
            config: undefined,
          }),
        ).toThrowError('Invalid status code');
      });
    });
    describe('error handler', () => {
      it('null error', async () => {
        expect(() => handleResponseError(null)).toThrowError('Error is null');
      });
      it('axios error - connection error', async () => {
        expect(() =>
          handleResponseError(
            new AxiosError('Test Error', 'ERR_NETWORK', undefined, undefined, {
              data: 'Test Error',
              status: 400,
              statusText: '',
              headers: undefined,
              config: undefined,
            }),
          ),
        ).toThrowError('Connection error');
      });
      it('axios error - connection canceled', async () => {
        expect(() =>
          handleResponseError(
            new AxiosError('Test Error', 'ERR_CANCELED', undefined, undefined, {
              data: 'Test Error',
              status: 400,
              statusText: '',
              headers: undefined,
              config: undefined,
            }),
          ),
        ).toThrowError('Connection canceled');
      });
      it('axios error - backend error', async () => {
        expect(() =>
          handleResponseError(
            new AxiosError('Test Error', '', undefined, undefined, {
              data: 'Test Error',
              status: 400,
              statusText: '',
              headers: undefined,
              config: undefined,
            }),
          ),
        ).toThrowError('Test Error');
      });
      it('axios error - unknown error', async () => {
        expect(() =>
          handleResponseError(
            new AxiosError('Test Error', '', undefined, undefined, {
              data: undefined,
              status: 400,
              statusText: '',
              headers: undefined,
              config: undefined,
            }),
          ),
        ).toThrowError('Unknown error');
      });
      it('unknown error', async () => {
        expect(() => handleResponseError('some unknown error')).toThrowError('Unknown error');
      });
    });
  });

  describe('methods', () => {
    let client: Client;
    beforeEach(() => {
      client = new Client({
        userManagementHost: 'http://localhost:3000',
        apiKey: 'api-key',
        version: '3.0.0',
      });
    });

    it('signUpOrLogIn', async () => {
      const body = {
        email,
        password: 'password',
      };

      await client.signUpOrLogIn(body);

      expect(mocks.post).toBeCalledWith('/users/init', body);
    });

    it('trackReactSdkAnalytics', async () => {
      await client.trackReactSdkAnalytics({
        reactSdkVersion: '1.0.0',
        props: { test: true },
      });

      expect(mocks.post).toBeCalledWith('/partners/analytics/react-sdk', {
        reactSdkVersion: '1.0.0',
        props: { test: true },
      });
    });

    it('getWalletBalance', async () => {
      await client.getWalletBalance({
        walletId,
        rpcUrl: 'https://test.com',
      });

      expect(mocks.get).toBeCalledWith(`/wallets/${walletId}/balance`, {
        params: {
          rpcUrl: 'https://test.com',
        },
      });
    });

    it('createUser', async () => {
      await client.createUser({
        email,
      });

      expect(mocks.post).toBeCalledWith('/users', {
        email,
      });
    });

    it('checkUserExists', async () => {
      await client.checkUserExists({
        email,
      });

      expect(mocks.get).toBeCalledWith('/users/exists', {
        params: {
          email,
        },
      });
    });

    it('verifyTelegram', async () => {
      const data = {
        username: 'username',
        auth_date: Date.now(),
        first_name: 'first_name',
        hash: 'hash',
        id: 1,
        last_name: 'last_name',
        photo_url: 'photo_url',
      };

      await client.verifyTelegram(data);

      expect(mocks.post).toBeCalledWith('/users/telegram/v2', { authObject: data });
    });

    it('verifyTelegram', async () => {
      const data = {
        username: 'username',
        auth_date: Date.now(),
        first_name: 'first_name',
        hash: 'hash',
        id: 1,
        last_name: 'last_name',
        photo_url: 'photo_url',
      };

      await client.verifyTelegram(data);

      expect(mocks.post).toBeCalledWith('/users/telegram/v2', { authObject: data });
    });

    it('verifyOAuth', async () => {
      await client.verifyOAuth();

      expect(mocks.post).toBeCalledWith('/users/verify-oauth');
    });

    it('loginExternalWallet', async () => {
      const body = {
        externalWallet: {
          address: 'external-address',
          type: 'EVM' as TWalletType,
          provider: 'metamask',
        },
      };

      await client.loginExternalWallet(body);

      expect(mocks.post).toBeCalledWith('/users/external-wallets/login/v2', body);
    });

    it('verifyNewAccount', async () => {
      const body = {
        email,
        verificationCode: 'verification-code',
      };

      await client.verifyNewAccount(userId, body);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/verify`, body);
    });

    it('verifyExternalWallet', async () => {
      const body = {
        externalWallet: {
          address: externalWalletAddress,
          type: 'EVM' as TWalletType,
          provider: 'metamask',
        },
        signedMessage: 'signedMessage',
      };

      await client.verifyExternalWallet(userId, body);
      expect(mocks.post).toBeCalledWith(`/users/${userId}/external-wallets/verify/v2`, body);
    });

    it('verifyEmail', async () => {
      const body = {
        verificationCode: 'verification-code',
      };

      await client.verifyEmail(userId, body);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/verify-email`, body);
    });

    it('verifyPhone', async () => {
      const body = {
        verificationCode: 'verification-code',
      };

      await client.verifyPhone(userId, body);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/verify-identifier`, body);
    });

    it('addSessionPublicKey', async () => {
      const body = {
        publicKey: 'public-key',
        sigDerivedPublicKey: 'sig-derived-public-key',
        status: PublicKeyStatus.PENDING,
        type: PublicKeyType.WEB,
        cosePublicKey: 'cose-public-key',
        clientDataJSON: 'client-data-json',
        aaguid: 'aaguid',
      };

      await client.addSessionPublicKey(userId, body);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/biometrics/key`, body);
    });

    it('getSessionPublicKeys', async () => {
      await client.getSessionPublicKeys(userId);

      expect(mocks.get).toBeCalledWith(`/users/${userId}/biometrics/keys`);
    });

    it('getBiometricLocationHints', async () => {
      const params = { email };

      await client.getBiometricLocationHints(params);

      expect(mocks.get).toBeCalledWith('/biometrics/location-hints', {
        params,
      });
    });

    it('getSessionPublicKey', async () => {
      const biometricId = 'biometricId';

      await client.getSessionPublicKey(userId, biometricId);

      expect(mocks.get).toBeCalledWith(`/users/${userId}/biometrics/${biometricId}`);
    });

    it('patchSessionPublicKey', async () => {
      const biometricId = 'biometricId';
      const body = {
        publicKey: 'public-key',
        sigDerivedPublicKey: 'sig-derived-public-key',
        status: PublicKeyStatus.PENDING,
        type: PublicKeyType.WEB,
        cosePublicKey: 'cose-public-key',
        clientDataJSON: 'client-data-json',
        aaguid: 'aaguid',
      };

      await client.patchSessionPublicKey(partnerId, userId, biometricId, body);

      expect(mocks.patch).toBeCalledWith(`/users/${userId}/biometrics/${biometricId}`, body, {
        headers: {
          [PARTNER_ID_HEADER_NAME]: partnerId,
        },
      });
    });

    it('getWebChallenge', async () => {
      const auth = {
        email,
      };

      await client.getWebChallenge(auth);

      expect(mocks.get).toBeCalledWith('/biometrics/challenge', {
        params: {
          email,
        },
      });
    });

    it('touchSession', async () => {
      const regenerate = true;

      await client.touchSession(regenerate);

      expect(mocks.post).toBeCalledWith(`/touch?regenerate=${!!regenerate}`);
    });

    it('sessionOrigin', async () => {
      const sessionLookupId = 'session-lookup-id';

      await client.sessionOrigin(sessionLookupId);

      expect(mocks.get).toBeCalledWith(`/sessions/${sessionLookupId}/origin`);
    });

    it('verifyWebChallenge', async () => {
      const body = {
        sessionLookupId: 'session-lookup-id',
        signature: {
          clientDataJSON: 'client-data-json',
          authenticatorData: 'authenticator-data',
          signature: 'signature',
        },
        publicKey: 'public-key',
        newDeviceSessionLookupId: 'new-device-session-lookup-id',
      };

      await client.verifyWebChallenge(partnerId, body);

      expect(mocks.post).toBeCalledWith(`/biometrics/verify`, body, {
        headers: {
          [PARTNER_ID_HEADER_NAME]: partnerId,
        },
      });
    });

    it('getSessionChallenge', async () => {
      await client.getSessionChallenge(userId);

      expect(mocks.get).toBeCalledWith(`/users/${userId}/biometrics/challenge`);
    });

    it('verifySessionChallenge', async () => {
      const body = {
        signature: {
          clientDataJSON: 'client-data-json',
          authenticatorData: 'authenticator-data',
          signature: 'signature',
        },
        publicKey: 'public-key',
      };

      await client.verifySessionChallenge(userId, body);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/biometrics/verify`, body);
    });

    it('createWallet', async () => {
      const body = {
        type: 'EVM' as TWalletType,
        network: Network.ETHEREUM,
        scheme: 'DKLS' as TWalletScheme,
        address: 'address',
        publicKey: 'public-key',
        chainId: 'chain-id',
        testMode: true,
        partnerId: 'partner-id',
      };

      await client.createWallet(userId, body);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/wallets`, body);
    });

    it('createPregenWallet', async () => {
      const body = {
        type: 'EVM',
        network: Network.ETHEREUM,
        scheme: 'DKLS',
        address: 'address',
        publicKey: 'public-key',
        chainId: 'chain-id',
        testMode: true,
        partnerId: 'partner-id',
        pregenIdentifierType: 'EMAIL',
        pregenIdentifier: email,
      };

      await client.createPregenWallet(body as any);

      expect(mocks.post).toBeCalledWith(`/wallets/pregen`, body);
    });

    it('getPregenWallets', async () => {
      const pregenIds = {
        EMAIL: [email],
      };

      await client.getPregenWallets(pregenIds, true);

      expect(mocks.get).toBeCalledWith('/wallets/pregen', {
        params: {
          ids: pregenIds,
          expand: true,
        },
      });
    });

    it('getPregenWallets', async () => {
      const pregenIds = {
        EMAIL: [email],
      };

      await client.getPregenWallets(pregenIds, true);

      expect(mocks.get).toBeCalledWith('/wallets/pregen', {
        params: {
          ids: pregenIds,
          expand: true,
        },
      });
    });

    it('claimPregenWallets', async () => {
      const body = {
        userId: 'user-id',
        walletIds: ['wallet-id'],
      };

      await client.claimPregenWallets(body);

      expect(mocks.post).toBeCalledWith(`/wallets/pregen/claim`, body);
    });

    it('claimPregenWallets', async () => {
      const body = {
        userId: 'user-id',
        walletIds: ['wallet-id'],
      };

      await client.claimPregenWallets(body);

      expect(mocks.post).toBeCalledWith(`/wallets/pregen/claim`, body);
    });

    it('sendTransaction', async () => {
      const body = {
        transaction: 'transaction',
        chain: Chain.ETH,
        chainId: '1',
      };

      await client.sendTransaction(userId, walletId, body);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/wallets/${walletId}/transactions/send`, body);
    });

    it('signTransaction', async () => {
      const body = {
        transaction: 'transaction',
        chainId: '1',
      };

      await client.signTransaction(userId, walletId, body);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/wallets/${walletId}/transactions/sign`, body);
    });

    it('refreshKeys', async () => {
      const body = {
        oldPartnerId: 'old-partner-id',
        newPartnerId: 'new-partner-id',
      };

      await client.refreshKeys(userId, walletId, body.oldPartnerId, body.newPartnerId);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/wallets/${walletId}/refresh`, body);
    });

    it('updatePregenWallet', async () => {
      const body = {
        pregenIdentifier: '+15555555555',
        pregenIdentifierType: 'PHONE',
      };

      await client.updatePregenWallet(walletId, body as any);

      expect(mocks.patch).toBeCalledWith(`/wallets/pregen/${walletId}`, body);
    });

    it('getWallets', async () => {
      const includePartnerData = true;

      await client.getWallets(userId, includePartnerData);

      expect(mocks.get).toBeCalledWith(
        `/users/${userId}/wallets?includePartnerData=${encodeURIComponent(includePartnerData)}`,
      );
    });

    it('getAllWallets', async () => {
      await client.getAllWallets(userId);

      expect(mocks.get).toBeCalledWith(`/users/${userId}/all-wallets`);
    });

    it('setCurrentWalletIds', async () => {
      const walletIds = {
        EVM: ['evm-wallet-id'],
      };
      const needsWallet = true;
      const sessionLookupId = 'session-lookup-id';
      const newDeviceSessionLookupId = 'new-device-session-lookup-id';

      await client.setCurrentWalletIds(userId, walletIds, needsWallet, sessionLookupId, newDeviceSessionLookupId);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/wallets/set`, {
        walletIds,
        needsWallet,
        sessionLookupId,
        newDeviceSessionLookupId,
      });
    });

    it('login', async () => {
      const body = {
        email,
      };

      await client.login(body);

      expect(mocks.post).toBeCalledWith('/login', body);
    });

    it('verifyLogin', async () => {
      const verificationCode = 'verification-code';

      await client.verifyLogin(verificationCode);

      expect(mocks.post).toBeCalledWith('/login/verify-email', { verificationCode });
    });

    it('logout', async () => {
      await client.logout();

      expect(mocks.get).toBeCalledWith('/logout');
    });

    it('recoveryVerification', async () => {
      const verificationCode = 'verification-code';

      await client.recoveryVerification(email, verificationCode);

      expect(mocks.post).toBeCalledWith('/recovery/verification', { email, verificationCode });
    });

    it('recoveryInit', async () => {
      await client.recoveryInit(email);

      expect(mocks.post).toBeCalledWith('/recovery', { email });
    });

    it('preSignMessage', async () => {
      await client.preSignMessage(userId, walletId, 'message', 'DKLS', 'cosmosSignDoc');

      expect(mocks.post).toBeCalledWith(`/users/${userId}/wallets/${walletId}/messages/sign`, {
        message: 'message',
        scheme: 'DKLS',
        cosmosSignDoc: 'cosmosSignDoc',
      });
    });

    it('deleteSelf', async () => {
      await client.deleteSelf(userId);

      expect(mocks.delete).toBeCalledWith(`/users/${userId}`);
    });

    it('uploadKeyshares', async () => {
      const encryptedKeyshares = [
        {
          encryptedShare: 'encrypted-share',
          encryptedKey: 'encrypted-key',
          type: KeyShareType.USER,
          biometricPublicKey: 'biometric-public-key',
          encryptor: EncryptorType.USER,
          recoveryPublicKeyId: 'recovery-public-key-id',
          partnerId: 'partner-id',
        },
      ];

      await client.uploadKeyshares(userId, walletId, encryptedKeyshares);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/wallets/${walletId}/key-shares`, {
        keyShares: encryptedKeyshares,
      });
    });

    it('uploadUserKeyShares', async () => {
      const encryptedKeyshares = [
        {
          encryptedShare: 'encrypted-share',
          encryptedKey: 'encrypted-key',
          type: KeyShareType.USER,
          walletId: 'wallet-id',
          biometricPublicKey: 'biometric-public-key',
          encryptor: EncryptorType.USER,
          recoveryPublicKeyId: 'recovery-public-key-id',
          partnerId: 'partner-id',
        },
      ];

      await client.uploadUserKeyShares(userId, encryptedKeyshares);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/key-shares`, {
        keyShares: encryptedKeyshares,
      });
    });

    it('getKeyshare', async () => {
      const type = KeyShareType.USER;
      const encryptor = EncryptorType.USER;

      await client.getKeyshare(userId, walletId, type, encryptor);

      expect(mocks.get).toBeCalledWith(
        `/users/${userId}/wallets/${walletId}/key-shares?type=${type}&encryptor=${encryptor}`,
      );
    });

    it('getBiometricKeyshares', async () => {
      const biometricPublicKey = 'biometric-public-key';
      const getAll = true;

      await client.getBiometricKeyshares(userId, biometricPublicKey, getAll);

      expect(mocks.get).toBeCalledWith(`/users/${userId}/biometrics/key-shares?publicKey=${biometricPublicKey}&all=true`);
    });

    it('getPasswordKeyshares', async () => {
      const getAll = true;

      await client.getPasswordKeyshares(userId, passwordId, getAll);

      expect(mocks.get).toBeCalledWith(`/users/${userId}/passwords/key-shares?passwordId=${passwordId}&all=true`);
    });

    it('uploadTransmissionKeyshares', async () => {
      const shares = [
        {
          walletId: 'wallet-id',
          encryptedShare: 'encrypted-share',
          encryptedKey: 'encrypted-key',
          sessionLookupId: 'session-lookup-id',
        },
      ];

      await client.uploadTransmissionKeyshares(userId, shares);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/temporary-shares`, { shares });
    });

    it('getTransmissionKeyshares', async () => {
      const sessionLookupId = 'session-lookup-id';

      await client.getTransmissionKeyshares(userId, sessionLookupId);

      expect(mocks.get).toBeCalledWith(`/users/${userId}/temporary-shares?sessionLookupId=${sessionLookupId}`);
    });

    it('getParaShare', async () => {
      await client.getParaShare(userId, walletId);

      expect(mocks.get).toBeCalledWith(`/users/${userId}/wallets/${walletId}/capsule-share`);
    });

    it('getBackupKit', async () => {
      await client.getBackupKit(userId, walletId);

      expect(mocks.get).toBeCalledWith(`/users/${userId}/wallets/${walletId}/download-backup-kit`, {
        responseType: 'blob',
      });
    });

    it('resendVerificationCode', async () => {
      const props = { homepageUrl: 'homepage-url' };

      await client.resendVerificationCode({ userId, ...props });

      expect(mocks.post).toBeCalledWith(`/users/${userId}/resend-verification-code`, { ...props });
    });

    it('resendVerificationCodeByPhone', async () => {
      const props = { homepageUrl: 'homepage-url' };

      await client.resendVerificationCodeByPhone({ userId, ...props });

      expect(mocks.post).toBeCalledWith(`/users/${userId}/resend-verification-code-by-phone`, { ...props });
    });

    it('cancelRecoveryAttempt', async () => {
      const email = 'email';

      await client.cancelRecoveryAttempt(email);

      expect(mocks.post).toBeCalledWith(`/recovery/cancel`, { email });
    });

    it('check2FAStatus', async () => {
      await client.check2FAStatus(userId);

      expect(mocks.get).toBeCalledWith(`/2fa/users/${userId}/check-status`);
    });

    it('enable2FA', async () => {
      const verificationCode = 'verification-code';

      await client.enable2FA(userId, verificationCode);

      expect(mocks.post).toBeCalledWith(`/2fa/users/${userId}/enable`, { verificationCode });
    });

    it('setup2FA', async () => {
      await client.setup2FA(userId);

      expect(mocks.post).toBeCalledWith(`/2fa/users/${userId}/setup`);
    });

    it('initializeRecovery', async () => {
      const email = 'email';

      await client.initializeRecovery(email);

      expect(mocks.post).toBeCalledWith(`/recovery/init`, { email });
    });

    it('initializeFarcasterLogin', async () => {
      await client.initializeFarcasterLogin();

      expect(mocks.post).toBeCalledWith(`/auth/farcaster/init`);
    });

    it('getFarcasterAuthStatusV2', async () => {
      await client.getFarcasterAuthStatus();

      expect(mocks.post).toBeCalledWith(`/auth/farcaster/status/v2`);
    });

    it('initializeRecoveryForPhone', async () => {
      const phone = 'phone';
      const countryCode = 'country-code';

      await client.initializeRecoveryForPhone(phone, countryCode);

      expect(mocks.post).toBeCalledWith(`/recovery/init`, { phone, countryCode });
    });

    it('finalizeRecovery', async () => {
      await client.finalizeRecovery(userId, walletId);

      expect(mocks.post).toBeCalledWith(`/recovery/users/${userId}/wallets/${walletId}/finish`);
    });

    it('recoverUserShares', async () => {
      await client.recoverUserShares(userId, walletId);

      expect(mocks.get).toBeCalledWith(
        `/recovery/users/${userId}/wallets/${walletId}/key-shares?type=USER&encryptor=RECOVERY`,
      );
    });

    it('verifyEmailForRecovery', async () => {
      const email = 'email';
      const verificationCode = 'verification-code';

      await client.verifyEmailForRecovery(email, verificationCode);

      expect(mocks.post).toBeCalledWith(`/recovery/verify-email`, { email, verificationCode });
    });

    it('verifyPhoneForRecovery', async () => {
      const phone = 'phone';
      const countryCode = 'country-code';
      const verificationCode = 'verification-code';

      await client.verifyPhoneForRecovery(phone, countryCode, verificationCode);

      expect(mocks.post).toBeCalledWith(`/recovery/verify-identifier`, { phone, countryCode, verificationCode });
    });

    it('verify2FA', async () => {
      const email = 'email';
      const verificationCode = 'verification-code';

      await client.verify2FA({ email }, verificationCode);

      expect(mocks.post).toBeCalledWith(`/2fa/verify`, { email, verificationCode });
    });

    it('verify2FAForPhone', async () => {
      const phone = '+19495551234';
      const verificationCode = 'verification-code';

      await client.verify2FAForPhone(phone, verificationCode);

      expect(mocks.post).toBeCalledWith(`/2fa/verify`, { phone, verificationCode });
    });

    it('tempTrasmissionInit', async () => {
      const message = 'message';

      await client.tempTrasmissionInit(message, userId);

      expect(mocks.post).toBeCalledWith(`/temporary-transmissions`, { message, userId });
    });

    it('tempTrasmission', async () => {
      const id = 'id';

      await client.tempTrasmission(id);

      expect(mocks.get).toBeCalledWith(`/temporary-transmissions/${id}`);
    });

    it('getPartner', async () => {
      await client.getPartner(partnerId);

      expect(mocks.get).toBeCalledWith(`/partners/${partnerId}`);
    });

    it('acceptScopes', async () => {
      const body = {
        scopeIds: ['scopeId'],
        partnerId: 'partnerId',
      };

      await client.acceptScopes(userId, walletId, body);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/wallets/${walletId}/scopes/accept`, body);
    });

    it('getPendingTransaction', async () => {
      const pendingTransactionId = 'pendingTransactionId';

      await client.getPendingTransaction(userId, pendingTransactionId);

      expect(mocks.get).toBeCalledWith(`/users/${userId}/pending-transactions/${pendingTransactionId}`);
    });

    it('acceptPendingTransaction', async () => {
      const pendingTransactionId = 'pendingTransactionId';

      await client.acceptPendingTransaction(userId, pendingTransactionId);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/pending-transactions/${pendingTransactionId}/accept`);
    });

    it('getOnRampConfig', async () => {
      await client.getOnRampConfig();

      expect(mocks.get).toBeCalledWith(`/on-ramp-config`);
    });

    it('createOnRampPurchase', async () => {
      const params = {
        type: OnRampPurchaseType.BUY,
        walletType: 'EVM' as TWalletType,
        address: 'address',
        provider: OnRampProvider.MOONPAY,
        networks: [Network.ETHEREUM],
        assets: [OnRampAsset.ETHEREUM],
        defaultNetwork: Network.ETHEREUM,
        defaultAsset: OnRampAsset.ETHEREUM,
        fiat: 'USD',
        fiatQuantity: '100',
        testMode: false,
      };

      await client.createOnRampPurchase({ userId, params, walletId });

      expect(mocks.post).toBeCalledWith(`/users/${userId}/wallets/${walletId}/purchases`, {
        ...params,
      });

      await client.createOnRampPurchase({ userId, params, externalWalletAddress });

      expect(mocks.post).toBeCalledWith(`/users/${userId}/external-wallets/${externalWalletAddress}/purchases`, {
        ...params,
      });
    });

    it('updateOnRampPurchase', async () => {
      const params = {
        userId: 'userId',
        purchaseId: 'purchaseId',
        updates: {
          fiatQuantity: '200',
        },
      };
      await client.updateOnRampPurchase({ ...params, walletId });

      expect(mocks.patch).toBeCalledWith(`/users/${params.userId}/wallets/${walletId}/purchases/${params.purchaseId}`, {
        ...params.updates,
      });

      await client.updateOnRampPurchase({ ...params, externalWalletAddress });

      expect(mocks.patch).toBeCalledWith(
        `/users/${params.userId}/external-wallets/${externalWalletAddress}/purchases/${params.purchaseId}`,
        {
          ...params.updates,
        },
      );
    });

    it('getOnRampPurchase', async () => {
      const purchaseId = 'purchaseId';

      await client.getOnRampPurchase({ userId, purchaseId, walletId });

      expect(mocks.get).toBeCalledWith(`/users/${userId}/wallets/${walletId}/purchases/${purchaseId}`);
    });

    it('signMoonPayUrl', async () => {
      const externalWalletAddress = 'external-wallet-address';
      const params = {
        url: 'url',
        type: 'EVM' as TWalletType,
        cosmosPrefix: 'cosmos',
        testMode: false,
      };

      await client.signMoonPayUrl(userId, { ...params, walletId });

      expect(mocks.post).toBeCalledWith(`/users/${userId}/wallets/${walletId}/moonpay-sign`, {
        ...params,
      });

      await client.signMoonPayUrl(userId, { ...params, externalWalletAddress });

      expect(mocks.post).toBeCalledWith(`/users/${userId}/external-wallets/${externalWalletAddress}/moonpay-sign`, {
        ...params,
      });
    });

    it('generateOffRampTx', async () => {
      const params = {
        provider: OnRampProvider.MOONPAY,
        chainId: '1',
        contractAddress: 'contract-address',
        testMode: false,
        walletId,
        walletType: 'EVM' as TWalletType,
        destinationAddress: 'destination-address',
        assetQuantity: '100',
      };

      await client.generateOffRampTx(userId, params);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/wallets/${params.walletId}/offramp-generate`, {
        ...params,
      });
    });

    it('sendOffRampTx', async () => {
      const params = {
        tx: 'tx',
        signature: 'signature',
        network: Network.ETHEREUM,
        walletType: 'EVM' as TWalletType,
      };

      await client.sendOffRampTx(userId, { ...params, walletId });

      expect(mocks.post).toBeCalledWith(`/users/${userId}/wallets/${walletId}/offramp-send`, {
        ...params,
      });
    });

    it('distributeParaShare', async () => {
      const useDKLS = true;
      const body = { homepageUrl: 'homepageUrl' };

      await client.distributeParaShare({ userId, walletId, useDKLS, ...body });

      expect(mocks.post).toBeCalledWith(`/users/${userId}/wallets/${walletId}/capsule-share/distribute`, {
        ...body,
        useDKLS: true,
      });
    });

    it('keepSessionAlive', async () => {
      await client.keepSessionAlive(userId);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/session/keep-alive`);
    });

    it('persistRecoveryPublicKeys', async () => {
      const publicKeys = ['public-key'];

      await client.persistRecoveryPublicKeys(userId, publicKeys);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/recovery-public-keys`, { publicKeys });
    });

    it('getRecoveryPublicKeys', async () => {
      await client.getRecoveryPublicKeys(userId);

      expect(mocks.get).toBeCalledWith(`/users/${userId}/recovery-public-keys`);
    });

    it('uploadEncryptedWalletPrivateKey', async () => {
      const body = {
        encryptedWalletPrivateKey: 'encryptedWalletPrivateKey',
        encryptionKeyHash: 'encryptionKeyHash',
        biometricPublicKey: 'biometricPublicKey',
        passwordId: 'passwordId',
      };

      await client.uploadEncryptedWalletPrivateKey(
        userId,
        body.encryptedWalletPrivateKey,
        body.encryptionKeyHash,
        body.biometricPublicKey,
        body.passwordId,
      );

      expect(mocks.post).toBeCalledWith(`/users/${userId}/encrypted-wallet-private-keys`, body);
    });

    it('getEncryptedWalletPrivateKeys', async () => {
      const encryptionKeyHash = 'encryptionKeyHash';

      await client.getEncryptedWalletPrivateKeys(userId, encryptionKeyHash);

      expect(mocks.get).toBeCalledWith(`/users/${userId}/encrypted-wallet-private-keys/${encryptionKeyHash}`);
    });

    it('getConversionRate', async () => {
      const chainId = 'chainId';
      const symbol = 'symbol';
      const currency = 'currency';

      await client.getConversionRate(chainId, symbol, currency);

      expect(mocks.get).toBeCalledWith(`/chains/${chainId}/conversion-rate`, {
        params: {
          symbol,
          currency,
        },
      });
    });

    it('getGasEstimate', async () => {
      const chainId = 'chainId';
      const totalGasPrice = 'totalGasPrice';

      await client.getGasEstimate(chainId, totalGasPrice);

      expect(mocks.get).toBeCalledWith(`/chains/${chainId}/gas-estimate`, {
        params: {
          totalGasPrice,
        },
      });
    });

    it('getGasOracle', async () => {
      const chainId = 'chainId';

      await client.getGasOracle(chainId);

      expect(mocks.get).toBeCalledWith(`/chains/${chainId}/gas-oracle`);
    });

    it('isRefreshDone', async () => {
      await client.isRefreshDone(userId, walletId, partnerId);

      expect(mocks.get).toBeCalledWith(`/users/${userId}/wallets/${walletId}/refresh-done?partnerId=${partnerId}`);
    });

    it('deletePendingTransaction', async () => {
      const pendingTransactionId = 'pendingTransactionId';

      await client.deletePendingTransaction(userId, pendingTransactionId);

      expect(mocks.delete).toBeCalledWith(`/users/${userId}/pending-transactions/${pendingTransactionId}`);
    });

    it('addSessionPasswordPublicKey', async () => {
      const body = {
        publicKey: 'public-key',
        sigDerivedPublicKey: 'sig-derived-public-key',
        status: PasswordStatus.PENDING,
      };

      await client.addSessionPasswordPublicKey(userId, body);

      expect(mocks.post).toBeCalledWith(`/users/${userId}/passwords/key`, body);
    });

    it('patchSessionPassword', async () => {
      const body = {
        publicKey: 'public-key',
        sigDerivedPublicKey: 'sig-derived-public-key',
        status: PasswordStatus.PENDING,
      };

      await client.patchSessionPassword(partnerId, userId, passwordId, body);

      expect(mocks.patch).toBeCalledWith(`/users/${userId}/passwords/${passwordId}`, body, {
        headers: {
          [PARTNER_ID_HEADER_NAME]: partnerId,
        },
      });
    });

    it('getSupportedAuthMethods', async () => {
      const auth = {
        email,
      };

      await client.getSupportedAuthMethods(auth);

      expect(mocks.get).toBeCalledWith('/users/supported-auth-methods', {
        params: {
          ...auth,
        },
      });
    });

    it('getPasswords', async () => {
      const auth = {
        email,
      };

      await client.getPasswords(auth);

      expect(mocks.get).toBeCalledWith('/users/passwords', {
        params: {
          ...auth,
        },
      });
    });

    it('verifyPasswordChallenge', async () => {
      const body = {
        sessionLookupId: 'session-lookup-id',
        signature: 'signature',
        publicKey: 'publicKey',
        newDeviceSessionLookupId: 'new-device-session-lookup-id',
      };

      await client.verifyPasswordChallenge(partnerId, body);

      expect(mocks.post).toBeCalledWith(`/passwords/verify`, body, {
        headers: {
          [PARTNER_ID_HEADER_NAME]: partnerId,
        },
      });
    });

    it('getEncryptedWalletPrivateKey', async () => {
      await client.getEncryptedWalletPrivateKey(passwordId);

      expect(mocks.get).toBeCalledWith(`/encrypted-wallet-private-keys?passwordId=${passwordId}`);
    });

    it('getUser', async () => {
      await client.getUser(userId);

      expect(mocks.get).toBeCalledWith(`/users/${userId}`);
    });

    it('getAccountMetadata', async () => {
      await client.getAccountMetadata(userId, partnerId);

      expect(mocks.get).toBeCalledWith(`/users/${userId}/oauth/accounts`, {
        params: {
          partnerId,
        },
      });
    });

    it('issueJwt', async () => {
      await client.issueJwt({ keyIndex: 1 });

      expect(mocks.post).toBeCalledWith(`/auth/jwt`, { keyIndex: 1 });
    });

    it('trackError', async () => {
      const methodName = 'testMethod';
      const error = { name: 'TestError', message: 'Test error message' };
      const sdkType = 'WEB';

      await client.trackError({
        methodName,
        error,
        sdkType,
        userId,
      });

      expect(mocks.post).toBeCalledWith('/errors/sdk', {
        methodName,
        error,
        sdkType,
        userId,
      });
    });
  });
});
