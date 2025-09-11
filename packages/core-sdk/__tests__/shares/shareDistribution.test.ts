import { describe, expect, it, vi, afterEach } from 'vitest';
import { SESSION_PUBLIC_KEYS, USER_ID, WALLET } from '../constants';
import { distributeNewShare } from '../../src/shares/shareDistribution.js';
import { Environment } from '../../src/types/index.js';
import { initClient } from '../../src/external/userManagementClient.js';
import { mockGetSessionPublicKeys, mockGetPasswords } from '../mocks/mockUserManagementClient.js';
import { EncryptorType, KeyShareType, TWalletScheme } from '@getpara/user-management-client';
import * as recovery from '../../src/shares/recovery';

const TEST_CTX = {
  apiKey: 'test-key-123',
  env: Environment.DEV,
  client: initClient({ apiKey: 'test-key-123', env: Environment.DEV }),
  disableWebSockets: false,
  useDKLS: true,
};

const sendRecoveryForShareSpy = vi.spyOn(recovery, 'sendRecoveryForShare');

const mockEnclaveClient = {
  persistSharesWithRetry: vi.fn().mockResolvedValue(undefined),
};

const TEST_CTX_WITH_ENCLAVE = {
  ...TEST_CTX,
  enclaveClient: mockEnclaveClient,
};

describe('shareDistribution', () => {
  describe('distributeNewShare', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('base', async () => {
      const resp = await distributeNewShare({
        ctx: TEST_CTX,
        userId: USER_ID,
        walletId: WALLET.id,
        userShare: 'test',
        isEnclaveUser: false,
        walletScheme: WALLET.scheme as TWalletScheme,
      });

      expect(mockGetSessionPublicKeys).toBeCalledTimes(1);
      expect(mockGetSessionPublicKeys).toBeCalledWith(USER_ID);
      expect(mockGetPasswords).toBeCalledTimes(1);
      expect(mockGetPasswords).toBeCalledWith({ userId: USER_ID });
      expect(sendRecoveryForShareSpy).toBeCalledTimes(1);
      expect(sendRecoveryForShareSpy).toBeCalledWith({
        ctx: TEST_CTX,
        userId: USER_ID,
        walletId: WALLET.id,
        otherEncryptedShares: [
          {
            encryptedShare: expect.stringMatching(/./),
            encryptedKey: expect.stringMatching(/./),
            type: KeyShareType.USER,
            encryptor: EncryptorType.BIOMETRICS,
            biometricPublicKey: SESSION_PUBLIC_KEYS[0].sigDerivedPublicKey,
            partnerId: undefined,
          },
        ],
        userSigner: 'test',
        ignoreRedistributingBackupEncryptedShare: false,
        emailProps: {},
      });
      expect(resp).toBe('');
    });
    it('with password', async () => {
      mockGetPasswords.mockResolvedValueOnce([
        { id: '1', sigDerivedPublicKey: SESSION_PUBLIC_KEYS[0].sigDerivedPublicKey },
        { id: '2', status: 'PENDING' },
      ]);
      const resp = await distributeNewShare({
        ctx: TEST_CTX,
        userId: USER_ID,
        walletId: WALLET.id,
        userShare: 'test',
        isEnclaveUser: false,
        walletScheme: WALLET.scheme as TWalletScheme,
      });

      expect(mockGetSessionPublicKeys).toBeCalledTimes(1);
      expect(mockGetSessionPublicKeys).toBeCalledWith(USER_ID);
      expect(mockGetPasswords).toBeCalledTimes(1);
      expect(mockGetPasswords).toBeCalledWith({ userId: USER_ID });
      expect(sendRecoveryForShareSpy).toBeCalledTimes(1);
      expect(sendRecoveryForShareSpy).toBeCalledWith({
        ctx: TEST_CTX,
        userId: USER_ID,
        walletId: WALLET.id,
        otherEncryptedShares: [
          {
            encryptedShare: expect.stringMatching(/./),
            encryptedKey: expect.stringMatching(/./),
            type: KeyShareType.USER,
            encryptor: EncryptorType.BIOMETRICS,
            biometricPublicKey: SESSION_PUBLIC_KEYS[0].sigDerivedPublicKey,
            partnerId: undefined,
          },
          {
            encryptedShare: expect.stringMatching(/./),
            encryptedKey: expect.stringMatching(/./),
            type: KeyShareType.USER,
            encryptor: EncryptorType.PASSWORD,
            partnerId: undefined,
            passwordId: '1',
          },
        ],
        userSigner: 'test',
        ignoreRedistributingBackupEncryptedShare: false,
        emailProps: {},
      });
      expect(resp).toBe('');
    });

    it('with isEnclaveUser true', async () => {
      const resp = await distributeNewShare({
        ctx: TEST_CTX_WITH_ENCLAVE,
        userId: USER_ID,
        walletId: WALLET.id,
        userShare: 'test-user-share',
        isEnclaveUser: true,
        walletScheme: WALLET.scheme as TWalletScheme,
        partnerId: 'test-partner',
        protocolId: 'test-protocol',
      });

      expect(mockEnclaveClient.persistSharesWithRetry).toBeCalledTimes(1);
      expect(mockEnclaveClient.persistSharesWithRetry).toBeCalledWith([
        {
          userId: USER_ID,
          walletId: WALLET.id,
          walletScheme: WALLET.scheme,
          signer: 'test-user-share',
          partnerId: 'test-partner',
          protocolId: 'test-protocol',
        },
      ]);
      expect(mockGetSessionPublicKeys).not.toBeCalled();
      expect(mockGetPasswords).not.toBeCalled();
      expect(sendRecoveryForShareSpy).not.toBeCalled();
      expect(resp).toBe('');
    });

    it('with isEnclaveUser true and no optional fields', async () => {
      const resp = await distributeNewShare({
        ctx: TEST_CTX_WITH_ENCLAVE,
        userId: USER_ID,
        walletId: WALLET.id,
        userShare: 'test-user-share',
        isEnclaveUser: true,
        walletScheme: WALLET.scheme as TWalletScheme,
      });

      expect(mockEnclaveClient.persistSharesWithRetry).toBeCalledTimes(1);
      expect(mockEnclaveClient.persistSharesWithRetry).toBeCalledWith([
        {
          userId: USER_ID,
          walletId: WALLET.id,
          walletScheme: WALLET.scheme,
          signer: 'test-user-share',
          partnerId: undefined,
          protocolId: undefined,
        },
      ]);
      expect(mockGetSessionPublicKeys).not.toBeCalled();
      expect(mockGetPasswords).not.toBeCalled();
      expect(sendRecoveryForShareSpy).not.toBeCalled();
      expect(resp).toBe('');
    });
  });
});
