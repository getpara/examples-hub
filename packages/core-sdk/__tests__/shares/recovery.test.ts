import { describe, expect, it, vi, afterEach } from 'vitest';
import { RECOVERY_PUBLIC_KEYS, USER_ID, WALLET } from '../constants';
import { sendRecoveryForShare } from '../../src/shares/recovery';
import { Environment } from '../../src/types/index.js';
import { initClient } from '../../src/external/userManagementClient.js';
import {
  mockUploadUserKeyShares,
  mockDistributeParaShare,
  mockPersistRecoveryPublicKeys,
} from '../mocks/mockUserManagementClient.js';
import { EncryptorType, KeyShareType } from '@getpara/user-management-client';

const TEST_CTX = {
  env: Environment.DEV,
  client: initClient({ env: Environment.DEV }),
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
      const resp = await sendRecoveryForShare({ ctx: TEST_CTX, userId: USER_ID, walletId: WALLET.id, userSigner: 'test' });

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
      expect(mockDistributeParaShare).toBeCalledTimes(1);
      expect(mockDistributeParaShare).toBeCalledWith({
        userId: USER_ID,
        walletId: WALLET.id,
        useDKLS: TEST_CTX.useDKLS,
      });
      expect(resp).toBe('');
    });
    it('include other shares', async () => {
      const resp = await sendRecoveryForShare({
        ctx: TEST_CTX,
        userId: USER_ID,
        walletId: WALLET.id,
        userSigner: 'test',
        otherEncryptedShares: OTHER_SHARES,
      });

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
      expect(mockDistributeParaShare).toBeCalledTimes(1);
      expect(mockDistributeParaShare).toBeCalledWith({
        userId: USER_ID,
        walletId: WALLET.id,
        useDKLS: TEST_CTX.useDKLS,
      });
      expect(resp).toBe('');
    });
    it('ignoreRedistributingBackupEncryptedShare', async () => {
      const resp = await sendRecoveryForShare({
        ctx: TEST_CTX,
        userId: USER_ID,
        walletId: WALLET.id,
        userSigner: 'test',
        ignoreRedistributingBackupEncryptedShare: true,
      });

      expect(mockUploadUserKeyShares).toBeCalledTimes(1);
      expect(mockUploadUserKeyShares).toBeCalledWith(USER_ID, []);
      expect(mockDistributeParaShare).toBeCalledTimes(0);
      expect(resp).toBe('');
    });
    it('ignoreRedistributingBackupEncryptedShare & include other shares', async () => {
      const resp = await sendRecoveryForShare({
        ctx: TEST_CTX,
        userId: USER_ID,
        walletId: WALLET.id,
        userSigner: 'test',
        otherEncryptedShares: OTHER_SHARES,
        ignoreRedistributingBackupEncryptedShare: true,
      });

      expect(mockUploadUserKeyShares).toBeCalledTimes(1);
      expect(mockUploadUserKeyShares).toBeCalledWith(
        USER_ID,
        OTHER_SHARES.map(s => ({ ...s, walletId: WALLET.id })),
      );
      expect(mockDistributeParaShare).toBeCalledTimes(0);
      expect(resp).toBe('');
    });
    it('forceRefresh', async () => {
      const resp = await sendRecoveryForShare({
        ctx: TEST_CTX,
        userId: USER_ID,
        walletId: WALLET.id,
        userSigner: 'test',
        forceRefresh: true,
      });

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
      expect(mockDistributeParaShare).toBeCalledTimes(1);
      expect(mockDistributeParaShare).toBeCalledWith({
        userId: USER_ID,
        walletId: WALLET.id,
        useDKLS: TEST_CTX.useDKLS,
      });
      expect(JSON.parse(resp).walletId).toBe(WALLET.id);
      expect(JSON.parse(resp).backupDecryptionKey).toStrictEqual(expect.stringMatching(/./));
    });
  });
});
