import { describe, expect, it, vi, afterEach } from 'vitest';
import { SESSION_PUBLIC_KEYS, USER_ID, WALLET } from '../constants';
import { distributeNewShare } from '../../src/shares/shareDistribution.js';
import { Environment } from '../../src/definitions.js';
import { initClient } from '../../src/external/userManagementClient.js';
import { mockGetSessionPublicKeys, mockGetPasswords } from '../mocks/mockUserManagementClient.js';
import { EncryptorType, KeyShareType } from '@getpara/user-management-client';
import * as recovery from '../../src/shares/recovery';

const TEST_CTX = {
  env: Environment.DEV,
  client: initClient({ env: Environment.DEV }),
  disableWebSockets: false,
  useDKLS: true,
};

const sendRecoveryForShareSpy = vi.spyOn(recovery, 'sendRecoveryForShare');

describe('shareDistribution', () => {
  describe('distributeNewShare', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('base', async () => {
      const resp = await distributeNewShare({ ctx: TEST_CTX, userId: USER_ID, walletId: WALLET.id, userShare: 'test' });

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
      const resp = await distributeNewShare({ ctx: TEST_CTX, userId: USER_ID, walletId: WALLET.id, userShare: 'test' });

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
  });
});
