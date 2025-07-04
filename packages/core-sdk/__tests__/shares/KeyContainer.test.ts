import { describe, expect, it, vi } from 'vitest';
import { KeyContainer } from '../../src';
import { WALLET, WALLET_KEYSHARE } from '../constants';
import * as eciesjs from 'eciesjs';

const TEST_BACKUP_STRING = 'test';

describe('KeyContainer', () => {
  describe('constructor', () => {
    it('creates a new instance of KeyContainer with correct fields', () => {
      const keyContainer = new KeyContainer(WALLET.id, WALLET_KEYSHARE, WALLET.address);

      expect(keyContainer).toBeInstanceOf(KeyContainer);
      expect(keyContainer.address).toBe(WALLET.address);
      expect(keyContainer.keyshare).toBe(WALLET_KEYSHARE);
      expect(keyContainer.walletId).toBe(WALLET.id);
      expect(keyContainer.backupDecryptionKey).toBeDefined();
      expect(keyContainer.backupDecryptionKey).toBeTypeOf('string');
      expect(keyContainer.backupDecryptionKey).lengthOf(64);
    });
    it('build from', () => {
      const keyContainerBase = new KeyContainer(WALLET.id, WALLET_KEYSHARE, WALLET.address);
      const keyContainerString = JSON.stringify(keyContainerBase);

      const keyContainer = KeyContainer.buildFrom(keyContainerString);

      expect(keyContainer).toBeInstanceOf(KeyContainer);
      expect(keyContainer).toStrictEqual(keyContainerBase);
    });
    it('build from - invalid JSON', () => {
      const keyContainerBase = new KeyContainer(WALLET.id, WALLET_KEYSHARE, WALLET.address);
      const keyContainerString = `${keyContainerBase.backupDecryptionKey}|test`;

      const keyContainer = KeyContainer.buildFrom(keyContainerString);

      expect(keyContainer).toBeInstanceOf(KeyContainer);
      expect(keyContainer.backupDecryptionKey).toBe(keyContainerBase.backupDecryptionKey);
    });
  });
  describe('functions', () => {
    it('getPublicEncryptionKey', () => {
      const keyContainer = new KeyContainer(WALLET.id, WALLET_KEYSHARE, WALLET.address);

      const resp = keyContainer.getPublicEncryptionKey();

      expect(resp).toBeInstanceOf(Buffer);
    });
    it('getPublicEncryptionKeyHex', () => {
      const keyContainer = new KeyContainer(WALLET.id, WALLET_KEYSHARE, WALLET.address);

      const pubEncryptionKey = keyContainer.getPublicEncryptionKey();
      const resp = keyContainer.getPublicEncryptionKeyHex();

      expect(resp).toBe(pubEncryptionKey.toString('hex'));
    });
    describe('encrypt / decrypt', () => {
      it('success', () => {
        const keyContainer = new KeyContainer(WALLET.id, WALLET_KEYSHARE, WALLET.address);

        const encryptResp = keyContainer.encryptForSelf(TEST_BACKUP_STRING);
        const decryptResp = keyContainer.decrypt(encryptResp);
        expect(decryptResp).toBe(TEST_BACKUP_STRING);
      });
      it('success - encryptWithPublicKey', () => {
        const keyContainer = new KeyContainer(WALLET.id, WALLET_KEYSHARE, WALLET.address);
        const pubEncryptionKey = keyContainer.getPublicEncryptionKey();

        const encryptResp = KeyContainer.encryptWithPublicKey(pubEncryptionKey, TEST_BACKUP_STRING);
        const decryptResp = keyContainer.decrypt(encryptResp);
        expect(decryptResp).toBe(TEST_BACKUP_STRING);
      });
      it('fail - encrypt', () => {
        vi.spyOn(eciesjs, 'encrypt').mockImplementationOnce(() => {
          throw new Error('test error');
        });

        const keyContainer = new KeyContainer(WALLET.id, WALLET_KEYSHARE, WALLET.address);

        expect(() => keyContainer.encryptForSelf(TEST_BACKUP_STRING)).toThrowError('Error encrypting backup');
      });
      it('fail - decrypt', () => {
        vi.spyOn(eciesjs, 'decrypt').mockImplementationOnce(() => {
          throw new Error('test error');
        });

        const keyContainer = new KeyContainer(WALLET.id, WALLET_KEYSHARE, WALLET.address);
        const encryptResp = keyContainer.encryptForSelf(TEST_BACKUP_STRING);

        expect(() => keyContainer.decrypt(encryptResp)).toThrowError('Error decrypting backup');
      });
      it('fail - encryptWithPublicKey', () => {
        vi.spyOn(eciesjs, 'encrypt').mockImplementationOnce(() => {
          throw new Error('test error');
        });

        const keyContainer = new KeyContainer(WALLET.id, WALLET_KEYSHARE, WALLET.address);
        const pubEncryptionKey = keyContainer.getPublicEncryptionKey();

        expect(() => KeyContainer.encryptWithPublicKey(pubEncryptionKey, TEST_BACKUP_STRING)).toThrowError(
          'Error encrypting backup',
        );
      });
    });
  });
});
