import {
  Encrypt as ECIESEncrypt,
  Decrypt as ECIESDecrypt,
} from '@celo/utils/lib/ecies.js';
import * as eutil from 'ethereumjs-util';
import * as forge from 'node-forge';

export class KeyContainer {
  public walletId: string;
  public keyshare: string;
  // Can be derived from the keyshare but setting it once helps speed things up
  public address: string;
  public backupDecryptionKey: string;

  constructor(walletId: string, keyshare: string, address: string) {
    this.walletId = walletId;
    this.keyshare = keyshare;
    this.address = address;
    this.backupDecryptionKey = Buffer.from(
      forge.random.getBytesSync(32),
      'binary'
    ).toString('hex');
  }

  static buildFrom(serializedContainer: string): KeyContainer {
    try {
        const parsedObject = JSON.parse(serializedContainer);
        return Object.assign(new KeyContainer('', '', ''), parsedObject);
    } catch (e) {
        const container = new KeyContainer('', '', '');
        container.backupDecryptionKey = serializedContainer.split('|')[0];
        return container;
    }
  }

  getPublicDecryptionKey(): Buffer {
    return Buffer.from(eutil.privateToPublic(Buffer.from(this.backupDecryptionKey, 'hex')));
  }

  encryptForSelf(backup: string): string {
    try {
      const pubkey = this.getPublicDecryptionKey();
      const data = ECIESEncrypt(pubkey, Buffer.from(backup, 'ucs2')).toString(
        'base64'
      );
      return data;
    } catch (error: any) {
      throw Error('Error encrypting backup');
    }
  }

  decrypt(encryptedBackup: string) {
    try {
      const buf = Buffer.from(encryptedBackup, 'base64');
      const data = ECIESDecrypt(
        Buffer.from(this.backupDecryptionKey, 'hex'),
        buf
      );
      return data.toString('ucs2');
    } catch (error: any) {
      throw Error('Error decrypting backup');
    }
  }
}
