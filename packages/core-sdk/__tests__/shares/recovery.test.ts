import { describe, expect, it, vi, afterEach } from 'vitest';
import { RECOVERY_PUBLIC_KEYS, USER_ID, WALLET } from '../constants';
import { sendRecoveryForShare } from '../../src/shares/recovery';
import { Environment } from '../../src/definitions.js';
import { initClient } from '../../src/external/capsuleClient.js';
import {
  mockUploadUserKeyShares,
  mockDistributeCapsuleShare,
  mockPersistRecoveryPublicKeys,
} from '../mocks/mockUserManagementClient.js';
import { EncryptorType, KeyShareType } from '@usecapsule/user-management-client';

const TEST_CTX = {
  env: Environment.DEV,
  capsuleClient: initClient(Environment.DEV),
  disableWebSockets: false,
  useDKLS: true,
};

const OTHER_SHARES = [{ encryptedShare: 'test', type: KeyShareType.USER, encryptor: EncryptorType.USER }];

describe('recovery', () => {
  describe('sendRecoveryForShare', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('base', async () => {
      const resp = await sendRecoveryForShare(TEST_CTX, USER_ID, WALLET.id, [], 'test', false, {}, false);

      expect(mockUploadUserKeyShares).toBeCalledTimes(1);
      expect(mockUploadUserKeyShares).toBeCalledWith(USER_ID, [
        {
          encryptedShare: expect.stringMatching(/./),
          encryptor: EncryptorType.RECOVERY,
          recoveryPublicKeyId: RECOVERY_PUBLIC_KEYS[0].id,
          type: KeyShareType.USER,
          walletId: WALLET.id,
        },
      ]);
      expect(mockDistributeCapsuleShare).toBeCalledTimes(1);
      expect(mockDistributeCapsuleShare).toBeCalledWith({
        userId: USER_ID,
        walletId: WALLET.id,
        useDKLS: TEST_CTX.useDKLS,
      });
      expect(resp).toBe('');
    });
    it('include other shares', async () => {
      const resp = await sendRecoveryForShare(TEST_CTX, USER_ID, WALLET.id, OTHER_SHARES, 'test', false, {}, false);

      expect(mockUploadUserKeyShares).toBeCalledTimes(1);
      expect(mockUploadUserKeyShares).toBeCalledWith(USER_ID, [
        ...OTHER_SHARES.map(s => ({ ...s, walletId: WALLET.id })),
        {
          encryptedShare: expect.stringMatching(/./),
          encryptor: EncryptorType.RECOVERY,
          recoveryPublicKeyId: RECOVERY_PUBLIC_KEYS[0].id,
          type: KeyShareType.USER,
          walletId: WALLET.id,
        },
      ]);
      expect(mockDistributeCapsuleShare).toBeCalledTimes(1);
      expect(mockDistributeCapsuleShare).toBeCalledWith({
        userId: USER_ID,
        walletId: WALLET.id,
        useDKLS: TEST_CTX.useDKLS,
      });
      expect(resp).toBe('');
    });
    it('ignoreRedistributingBackupEncryptedShare', async () => {
      const resp = await sendRecoveryForShare(TEST_CTX, USER_ID, WALLET.id, [], 'test', true, {}, false);

      expect(mockUploadUserKeyShares).toBeCalledTimes(1);
      expect(mockUploadUserKeyShares).toBeCalledWith(USER_ID, []);
      expect(mockDistributeCapsuleShare).toBeCalledTimes(0);
      expect(resp).toBe('');
    });
    it('ignoreRedistributingBackupEncryptedShare & include other shares', async () => {
      const resp = await sendRecoveryForShare(TEST_CTX, USER_ID, WALLET.id, OTHER_SHARES, 'test', true, {}, false);

      expect(mockUploadUserKeyShares).toBeCalledTimes(1);
      expect(mockUploadUserKeyShares).toBeCalledWith(
        USER_ID,
        OTHER_SHARES.map(s => ({ ...s, walletId: WALLET.id })),
      );
      expect(mockDistributeCapsuleShare).toBeCalledTimes(0);
      expect(resp).toBe('');
    });
    it('forceRefresh', async () => {
      const resp = await sendRecoveryForShare(TEST_CTX, USER_ID, WALLET.id, [], 'test', false, {}, true);

      expect(mockPersistRecoveryPublicKeys).toBeCalledTimes(1);
      expect(mockPersistRecoveryPublicKeys).toBeCalledWith(USER_ID, [expect.stringMatching(/./)]);
      expect(mockUploadUserKeyShares).toBeCalledTimes(1);
      expect(mockUploadUserKeyShares).toBeCalledWith(USER_ID, [
        {
          encryptedShare: expect.stringMatching(/./),
          encryptor: EncryptorType.RECOVERY,
          recoveryPublicKeyId: RECOVERY_PUBLIC_KEYS[0].id,
          type: KeyShareType.USER,
          walletId: WALLET.id,
        },
      ]);
      expect(mockDistributeCapsuleShare).toBeCalledTimes(1);
      expect(mockDistributeCapsuleShare).toBeCalledWith({
        userId: USER_ID,
        walletId: WALLET.id,
        useDKLS: TEST_CTX.useDKLS,
      });
      expect(JSON.parse(resp).walletId).toBe(WALLET.id);
      expect(JSON.parse(resp).backupDecryptionKey).toStrictEqual(expect.stringMatching(/./));
    });
  });
});
