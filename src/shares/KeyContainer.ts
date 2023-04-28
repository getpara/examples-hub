import {
  Encrypt as ECIESEncrypt,
  AES128DecryptAndHMAC,
} from '@celo/utils/lib/ecies';
import * as eutil from 'ethereumjs-util';
import * as elliptic from 'elliptic';
import { createHash } from 'crypto-browserify';
import * as forge from 'node-forge';
// import { Buffer } from 'buffer';

const ec = new elliptic.ec('secp256k1');

/**
 * Manages information for a keyshare that must be persisted
 * Helps with encryption and decryption of Capsule backups
 */

const IncCounter = (ctr: Buffer) => {
  for (let i = ctr.length - 1; i >= 0; i--) {
    ctr[i]++;
    if (ctr[i] !== 0) {
      return ctr;
    }
  }
  return ctr;
};

const ConcatKDF = (px: Buffer, kdLen: number) => {
  const blockSize = 32;
  const reps = ((kdLen + 7) * 8) / (blockSize * 8);
  let counter = Buffer.from('00000001', 'hex');
  let k = Buffer.from('00', 'hex');
  for (let i = 0; i <= reps; i++) {
    const hash = createHash('sha256');
    hash.update(counter);
    hash.update(px);
    k = Buffer.concat([k, hash.digest()]);
    counter = IncCounter(counter);
  }
  return k.slice(1, kdLen + 1);
};

/**
 * ECIES decrypt
 * @param {Buffer} privKey Ethereum private key, 32 bytes.
 * @param {Buffer} encrypted Encrypted message, serialized, 113+ bytes
 * @returns {Buffer} plaintext
 */
export function ECIESDecrypt(privKey: Buffer, encrypted: Buffer) {
  // Read iv, ephemPubKey, mac, ciphertext from encrypted message
  const ephemPubKeyEncoded = encrypted.slice(0, 65);
  const symmetricEncrypted = encrypted.slice(65);

  // NOTE: elliptic is disabled elsewhere in this library to prevent
  // accidental signing of truncated messages.
  // tslint:disable-next-line:import-blacklist
  // const EC = require('elliptic').ec
  // const ec = new EC('secp256k1')

  const ephemPubKey = ec.keyFromPublic(ephemPubKeyEncoded).getPublic();
  const px = ec.keyFromPrivate(privKey).derive(ephemPubKey);
  const hash = ConcatKDF(px.toArrayLike(Buffer), 32);
  // km, ke
  const encryptionKey = hash.slice(0, 16);
  const macKey = createHash('sha256').update(hash.slice(16)).digest();

  return AES128DecryptAndHMAC(encryptionKey, macKey, symmetricEncrypted);
}

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

  static import(serializedContainer: string): KeyContainer {
    return Object.assign(
      new KeyContainer('', '', ''),
      JSON.parse(serializedContainer)
    );
  }

  getPublicDecryptionKey(): Buffer {
    return eutil.privateToPublic(Buffer.from(this.backupDecryptionKey, 'hex'));
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
