import { PrivateKey, decrypt, encrypt } from 'eciesjs';
import { randomBytes } from 'crypto';

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
    let error: Error | null = null;
    for (let i = 0; i < 20; i++) {
      try {
        const backupDecryptionKey = randomBytes(32).toString('hex');
        // PrivateKey.fromHex throws error when private key is larger than group order
        // so we want to keep trying until we get a valid private key
        PrivateKey.fromHex(backupDecryptionKey);
        this.backupDecryptionKey = backupDecryptionKey;
        break;
      } catch (e) {
        error = e as Error;
        continue;
      }
    }
    if (!this.backupDecryptionKey) {
      throw new Error('Failed to generate backup decryption key: ' + error?.message);
    }
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

  getPublicEncryptionKey(): Buffer {
    const privateKey = PrivateKey.fromHex(this.backupDecryptionKey);
    return Buffer.from(privateKey.publicKey.toBytes(true));
  }

  getPublicEncryptionKeyHex(): string {
    return this.getPublicEncryptionKey().toString('hex');
  }

  encryptForSelf(backup: string): string {
    try {
      const pubkey = this.getPublicEncryptionKeyHex();
      const data = Buffer.from(encrypt(pubkey, new Uint8Array(Buffer.from(backup, 'ucs2')))).toString('base64');
      return data;
    } catch (error: any) {
      throw Error('Error encrypting backup');
    }
  }

  static encryptWithPublicKey(publicKey: Buffer, backup: string): string {
    try {
      const data = Buffer.from(encrypt(publicKey.toString('hex'), new Uint8Array(Buffer.from(backup, 'ucs2')))).toString(
        'base64',
      );
      return data;
    } catch (error: any) {
      throw Error('Error encrypting backup');
    }
  }

  decrypt(encryptedBackup: string): string {
    try {
      const buf = Buffer.from(encryptedBackup, 'base64');
      const data = decrypt(this.backupDecryptionKey, new Uint8Array(buf));
      return Buffer.from(data).toString('ucs2');
    } catch (error: any) {
      throw Error('Error decrypting backup');
    }
  }
}
