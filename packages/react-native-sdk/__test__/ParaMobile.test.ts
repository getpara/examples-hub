import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Environment } from '@getpara/core-sdk';

import mockReactNativeUtils from './mocks/mockReactNativeUtils';
import { WalletScheme, PublicKeyStatus } from '@getpara/user-management-client';
import { Passkey } from './mocks/mockPasskey';

vi.mock('../src/react-native/ReactNativeUtils', () => ({
  ReactNativeUtils: vi.fn().mockImplementation(() => mockReactNativeUtils),
}));

vi.mock('../src/config', () => ({
  setEnv: vi.fn(),
}));

vi.mock('react-native-passkey', () => ({
  Passkey,
}));

vi.mock('crypto', () => ({
  webcrypto: {
    getRandomValues: vi.fn(arr => arr.fill(1)),
  },
}));

import * as crypto from 'crypto';
import base64url from 'base64url';

vi.stubGlobal(
  'fetch',
  vi.fn(async () => ({ ok: true, json: async () => ({}) })),
);

const webSdkMocks = vi.hoisted(() => ({
  getAsymmetricKeyPair: vi.fn(),
  getPublicKeyHex: vi.fn(),
  getSHA256HashHex: vi.fn(),
  encryptPrivateKey: vi.fn(),
  parseCredentialCreationRes: vi.fn(),
  getDerivedPrivateKeyAndDecrypt: vi.fn(),
  decryptPrivateKeyAndDecryptShare: vi.fn(),
}));
vi.mock('@getpara/web-sdk', async () => {
  const actual = await vi.importActual<typeof import('@getpara/web-sdk')>('@getpara/web-sdk');
  return { ...actual, ...webSdkMocks };
});

import { ParaMobile } from '../src/react-native/ParaMobile';

describe('ParaMobile', () => {
  let paraMobile: ParaMobile;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReactNativeUtils.reset && mockReactNativeUtils.reset();
    Object.values(webSdkMocks).forEach(fn => fn.mockReset());
    paraMobile = new ParaMobile(Environment.BETA, 'test_api_key');
  });

  it('should create an instance of ParaMobile and set env and apiKey', () => {
    expect(paraMobile).toBeInstanceOf(ParaMobile);
    expect(paraMobile.ctx.env).toBe(Environment.BETA);
    expect(paraMobile.ctx.apiKey).toBe('test_api_key');
  });

  it('should use ReactNativeUtils as the platform utils', () => {
    expect(mockReactNativeUtils).toBeDefined();
  });

  it('should throw error when relyingPartyId is not provided for DEV environment', () => {
    expect(() => new ParaMobile(Environment.DEV, 'test_api_key')).toThrow('relyingPartyId is required');
  });

  it('should set correct relyingPartyId based on environment', () => {
    const betaInstance = new ParaMobile(Environment.BETA, 'test_api_key') as any;
    expect(betaInstance.relyingPartyId).toBe('app.beta.usecapsule.com');

    const sandboxInstance = new ParaMobile(Environment.SANDBOX, 'test_api_key') as any;
    expect(sandboxInstance.relyingPartyId).toBe('app.sandbox.usecapsule.com');

    const prodInstance = new ParaMobile(Environment.PROD, 'test_api_key') as any;
    expect(prodInstance.relyingPartyId).toBe('app.usecapsule.com');
  });

  it('should use custom relyingPartyId when provided', () => {
    const customInstance = new ParaMobile(Environment.BETA, 'test_api_key', 'custom.domain.com') as any;
    expect(customInstance.relyingPartyId).toBe('custom.domain.com');
  });

  describe('registerPasskey', () => {
    beforeEach(() => {
      paraMobile.ctx.client = {
        touchSession: vi.fn().mockResolvedValue({ partnerId: 'mock-partner-id', sessionLookupId: 'lookup' }),
        patchSessionPublicKey: vi.fn().mockResolvedValue({}),
        uploadEncryptedWalletPrivateKey: vi.fn().mockResolvedValue({}),
      } as any;

      // Set userId directly on the instance
      paraMobile.userId = 'mock-user-id';

      // Set auth info to avoid "auth is not set" error
      paraMobile.setEmail('test@example.com');

      webSdkMocks.getAsymmetricKeyPair.mockResolvedValue({
        publicKey: 'mock-public-key',
        privateKey: 'mock-private-key',
      });
      webSdkMocks.getPublicKeyHex.mockReturnValue('mock-public-key-hex');
      webSdkMocks.getSHA256HashHex.mockReturnValue('mock-hash');
      webSdkMocks.encryptPrivateKey.mockResolvedValue('mock-encrypted-key');
      webSdkMocks.parseCredentialCreationRes.mockReturnValue({
        cosePublicKey: 'mock-cose-public-key',
        clientDataJSON: 'mock-client-data-json',
      });
    });

    it('should register passkey successfully with email auth', async () => {
      paraMobile.setEmail = vi.fn().mockResolvedValue(undefined);

      const authState = {
        stage: 'signup' as const,
        passkeyId: 'mock-passkey-id',
        auth: { email: 'test@example.com' },
        userId: 'mock-user-id',
        signupAuthMethods: [],
        isPasskeySupported: true,
      };

      await paraMobile.registerPasskey(authState);

      const userHandleEncoded = base64url.encode(new Uint8Array(32).fill(1) as any);
      const expectedRequest = expect.objectContaining({
        rp: { id: 'app.beta.usecapsule.com', name: 'Para' },
        user: { id: userHandleEncoded, name: 'test@example.com', displayName: 'test@example.com' },
      });

      expect(Passkey.create).toHaveBeenCalledWith(expectedRequest);

      expect(paraMobile.ctx.client.touchSession).toHaveBeenCalled();

      const [partnerId, userId, passkeyId, update] = (paraMobile.ctx.client.patchSessionPublicKey as any).mock.calls[0];
      expect(partnerId).toBe('mock-partner-id');
      expect(userId).toBe('mock-user-id');
      expect(passkeyId).toBe('mock-passkey-id');
      expect(update).toEqual(
        expect.objectContaining({
          sigDerivedPublicKey: 'mock-public-key-hex',
          cosePublicKey: 'mock-cose-public-key',
          clientDataJSON: 'mock-client-data-json',
          status: PublicKeyStatus.COMPLETE,
        }),
      );

      expect(paraMobile.ctx.client.uploadEncryptedWalletPrivateKey).toHaveBeenCalledWith(
        'mock-user-id',
        'mock-encrypted-key',
        'mock-hash',
        update.publicKey,
      );
    });

    it('should handle Passkey.create returning a string', async () => {
      paraMobile.setEmail = vi.fn().mockResolvedValue(undefined);
      const json = JSON.stringify({
        id: 'mock-credential-id',
        response: { clientDataJSON: 'a', attestationObject: 'b' },
      });
      Passkey.create.mockResolvedValue(json as any);

      const authState = {
        stage: 'signup' as const,
        passkeyId: 'mock-passkey-id',
        auth: { email: 'test@example.com' },
        userId: 'mock-user-id',
        signupAuthMethods: [],
        isPasskeySupported: true,
      };

      await paraMobile.registerPasskey(authState);

      const call = (paraMobile.ctx.client.patchSessionPublicKey as any).mock.calls[0];
      expect(call[3]).toEqual(expect.objectContaining({ publicKey: 'mock-credential-id' }));
    });

    it('should throw error if webcrypto is not available', async () => {
      // Mock webcrypto to be unavailable
      const originalGetRandom = crypto.webcrypto.getRandomValues;
      // @ts-ignore
      crypto.webcrypto.getRandomValues = undefined;

      const authState = {
        stage: 'signup' as const,
        passkeyId: 'mock-passkey-id',
        auth: { email: 'test@example.com' },
        userId: 'mock-user-id',
        signupAuthMethods: [],
        isPasskeySupported: true,
      };

      await expect(paraMobile.registerPasskey(authState)).rejects.toThrow('Web crypto is not available');

      crypto.webcrypto.getRandomValues = originalGetRandom;
    });
  });

  describe('loginWithPasskey', () => {
    beforeEach(() => {
      paraMobile.ctx.client = {
        getWebChallenge: vi.fn().mockResolvedValue({
          challenge: 'mock-challenge',
          allowedPublicKeys: ['mock-public-key'],
        }),
        touchSession: vi.fn().mockResolvedValue({ partnerId: 'mock-partner-id', sessionLookupId: 'lookup' }),
        verifyWebChallenge: vi.fn().mockResolvedValue({ data: { userId: 'mock-user-id' } }),
        getUser: vi.fn().mockResolvedValue({
          user: {
            email: 'test@example.com',
            phone: { number: '1234567890', countryCode: '+1' },
            farcasterUsername: 'testuser',
          },
        }),
        getBiometricKeyshares: vi.fn().mockResolvedValue({
          data: { keyShares: ['mock-keyshare'] },
        }),
        getEncryptedWalletPrivateKeys: vi.fn().mockResolvedValue({
          encryptedPrivateKeys: [],
        }),
        uploadEncryptedWalletPrivateKey: vi.fn().mockResolvedValue({}),
        getWallets: vi.fn().mockResolvedValue({
          data: {
            wallets: [{ id: 'mock-wallet-id', address: 'mock-address', scheme: WalletScheme.CGGMP }],
          },
        }),
      } as any;

      webSdkMocks.getDerivedPrivateKeyAndDecrypt.mockResolvedValue([{ walletId: 'mock-wallet-id', signer: 'mock-signer' }]);

      // Mock methods on the ParaMobile instance
      paraMobile.setUserId = vi.fn().mockResolvedValue(undefined);
      paraMobile.setPhoneNumber = vi.fn().mockResolvedValue(undefined);
      paraMobile.setEmail = vi.fn().mockResolvedValue(undefined);
      paraMobile.setFarcasterUsername = vi.fn().mockResolvedValue(undefined);
      paraMobile.setWallets = vi.fn().mockResolvedValue(undefined);
      paraMobile.setCurrentWalletIds = vi.fn().mockResolvedValue(undefined);

      // Mock protected methods
      vi.spyOn(paraMobile as any, 'assertIsAuthSet').mockReturnValue({ identifier: 'test@example.com' });
      vi.spyOn(paraMobile as any, 'assertUserId').mockReturnValue('mock-user-id');
    });

    it('should login successfully with passkey auth', async () => {
      await paraMobile.loginWithPasskey();

      expect(paraMobile.ctx.client.getWebChallenge).toHaveBeenCalledWith({ userId: 'mock-user-id' });

      const passkeyReq = {
        challenge: 'mock-challenge',
        timeout: 60000,
        rpId: 'app.beta.usecapsule.com',
        allowCredentials: [{ type: 'public-key', id: 'mock-public-key' }],
      };
      expect(Passkey.get).toHaveBeenCalledWith(passkeyReq);

      const verifyArgs = (paraMobile.ctx.client.verifyWebChallenge as any).mock.calls[0];
      expect(verifyArgs[0]).toBe('mock-partner-id');
      expect(verifyArgs[1]).toEqual({
        publicKey: expect.any(String),
        signature: {
          clientDataJSON: 'eyJ0eXAiOiJKV1QifQ',
          authenticatorData: 'YXV0aGRhdGE=',
          signature: 'c2lnbmF0dXJl',
        },
      });

      expect(paraMobile.setWallets).toHaveBeenCalledWith({
        'mock-wallet-id': {
          id: 'mock-wallet-id',
          signer: 'mock-signer',
          address: 'mock-address',
          publicKey: undefined,
          scheme: WalletScheme.CGGMP,
          type: undefined,
        },
      });
      expect(paraMobile.setCurrentWalletIds).toHaveBeenCalledWith(
        { EVM: ['mock-wallet-id'] },
        { sessionLookupId: 'lookup' },
      );
    });

    it('should handle existing encrypted key', async () => {
      (paraMobile.ctx.client.getEncryptedWalletPrivateKeys as any).mockResolvedValue({
        encryptedPrivateKeys: [{ encryptedPrivateKey: 'ekey' }],
      });
      webSdkMocks.decryptPrivateKeyAndDecryptShare.mockResolvedValue([
        { walletId: 'mock-wallet-id', signer: 'mock-signer', encryptedPrivateKey: 'ekey' },
      ]);

      await paraMobile.loginWithPasskey();

      expect(webSdkMocks.decryptPrivateKeyAndDecryptShare).toHaveBeenCalledWith('dXNlcg==', ['mock-keyshare'], 'ekey');
    });

    it('should handle login when allowedPublicKeys is empty and wallet has no address', async () => {
      (paraMobile.ctx.client.getWebChallenge as any).mockResolvedValue({ challenge: 'c', allowedPublicKeys: [] });
      (paraMobile.ctx.client.getWallets as any).mockResolvedValue({
        data: { wallets: [{ id: 'mock-wallet-id', scheme: WalletScheme.CGGMP }] },
      });
      (paraMobile.ctx.client.getEncryptedWalletPrivateKeys as any).mockResolvedValue({
        encryptedPrivateKeys: [{ encryptedPrivateKey: 'ekey' }],
      });
      webSdkMocks.decryptPrivateKeyAndDecryptShare.mockResolvedValue([
        { walletId: 'mock-wallet-id', signer: 'mock-signer' },
      ]);

      await paraMobile.loginWithPasskey();

      expect(Passkey.get).toHaveBeenCalledWith({
        challenge: 'c',
        timeout: 60000,
        rpId: 'app.beta.usecapsule.com',
        allowCredentials: [],
      });
      expect(paraMobile.ctx.client.verifyWebChallenge).toHaveBeenCalled();
    });

    it('should handle Passkey.get returning a string', async () => {
      Passkey.get.mockResolvedValue(
        JSON.stringify({
          id: 'mock-credential-id',
          response: { clientDataJSON: 'a', authenticatorData: 'b', signature: 'c', userHandle: 'u' },
        }) as any,
      );
      await paraMobile.loginWithPasskey();
      const verifyArgs = (paraMobile.ctx.client.verifyWebChallenge as any).mock.calls[0];
      expect(verifyArgs[1]).toEqual({
        publicKey: 'mock-credential-id',
        signature: { clientDataJSON: 'a', authenticatorData: 'b', signature: 'c' },
      });
    });
  });
});
