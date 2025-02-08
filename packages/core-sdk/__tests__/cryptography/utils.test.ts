import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  decodePrivateKeyPemHex,
  decryptPrivateKey,
  decryptPrivateKeyAndDecryptShare,
  decryptPrivateKeyWithPassword,
  decryptWithKeyPair,
  decryptWithPrivateKey,
  encodePrivateKeyToPemHex,
  encryptPrivateKey,
  encryptPrivateKeyWithPassword,
  encryptWithDerivedPublicKey,
  getAsymmetricKeyPair,
  getDerivedPrivateKeyAndDecrypt,
  getPublicKeyFromSignature,
  getPublicKeyHex,
  getSHA256HashHex,
  hashPasswordWithSalt,
  publicKeyFromHex,
  publicKeyHexToPem,
  symmetricKeyEncryptMessage,
} from '../../src/cryptography/utils.js';
import { CRYPTOGRAPHY_UTILS_TEST_VARS } from '../constants.js';
import { Environment } from '../../src/types/index.js';
import { initClient } from '../../src/external/userManagementClient.js';
import { getWorkerContent } from '../utils.js';
import forge from 'node-forge';
import { WalletScheme } from '@getpara/user-management-client';

// Remove white space from PEM strings to ensure values are compared accurately
const cleanPEMString = (str: string) => str.replace(/\s+/g, '');

const SAMPLE_CTX = {
  env: Environment.DEV,
  client: initClient({ env: Environment.DEV }),
  disableWebSockets: false,
};

describe('utils', () => {
  let testKeyPair: forge.pki.rsa.KeyPair;

  beforeAll(async () => {
    const workerFileContent = await getWorkerContent();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(workerFileContent),
      } as Response),
    );

    testKeyPair = await getAsymmetricKeyPair(SAMPLE_CTX, getSHA256HashHex(CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_KEY_PAIR_SEED));
  });

  describe('getAsymmetricKeyPair', () => {
    it('pass', async () => {
      expect(testKeyPair.publicKey).toBeDefined();
      expect(testKeyPair.privateKey).toBeDefined();
    });

    it('fail', async () => {
      vi.spyOn(forge.pki.rsa, 'generateKeyPair').mockImplementationOnce((ops, cb) => {
        cb?.(new Error('Test Error'), {} as forge.pki.rsa.KeyPair);
        return {} as forge.pki.rsa.KeyPair;
      });

      expect(
        getAsymmetricKeyPair(SAMPLE_CTX, getSHA256HashHex(CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_KEY_PAIR_SEED)),
      ).rejects.toThrow('Test Error');
    });
  });

  it('getSHA256HashHex', () => {
    const resp = getSHA256HashHex(CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_STRING);
    expect(resp).toBe(CRYPTOGRAPHY_UTILS_TEST_VARS.SHA_256_HASH_HEX);
  });

  it('getPublicKeyHex', () => {
    const resp = getPublicKeyHex(testKeyPair);
    expect(resp).toBe(CRYPTOGRAPHY_UTILS_TEST_VARS.PUBLIC_KEY_HEX);
  });

  it('publicKeyFromHex', () => {
    const resp = publicKeyFromHex(CRYPTOGRAPHY_UTILS_TEST_VARS.PUBLIC_KEY_HEX);

    const publicKeyPem = forge.pki.publicKeyToPem(resp);

    expect(cleanPEMString(publicKeyPem)).toBe(cleanPEMString(CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_PUBLIC_KEY_PEM));
  });

  it('publicKeyHexToPem', () => {
    const resp = publicKeyHexToPem(CRYPTOGRAPHY_UTILS_TEST_VARS.PUBLIC_KEY_HEX);

    expect(cleanPEMString(resp)).toBe(cleanPEMString(CRYPTOGRAPHY_UTILS_TEST_VARS.RSA_PUBLIC_KEY_PEM));
  });

  it('encodePrivateKeyToPemHex', () => {
    const resp = encodePrivateKeyToPemHex(testKeyPair);

    expect(cleanPEMString(resp)).toBe(cleanPEMString(CRYPTOGRAPHY_UTILS_TEST_VARS.PRIVATE_KEY_PEM_HEX));
  });

  it('decodePrivateKeyPemHex', () => {
    const resp = decodePrivateKeyPemHex(CRYPTOGRAPHY_UTILS_TEST_VARS.PRIVATE_KEY_PEM_HEX);

    const privateKeyPem = forge.pki.privateKeyToPem(resp);

    expect(cleanPEMString(privateKeyPem)).toBe(cleanPEMString(CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_PRIVATE_KEY_PEM));
  });

  it('encryptPrivateKey', async () => {
    const resp = await encryptPrivateKey(testKeyPair, CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_ENCRYPTION_KEY);

    expect(resp).toBe(CRYPTOGRAPHY_UTILS_TEST_VARS.ENCRYPT_PRIVATE_KEY_RESP);
  });

  it('decryptPrivateKey', async () => {
    const resp = await decryptPrivateKey(
      CRYPTOGRAPHY_UTILS_TEST_VARS.ENCRYPT_PRIVATE_KEY_RESP,
      CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_ENCRYPTION_KEY,
    );
    const privateKeyPem = forge.pki.privateKeyToPem(resp);

    expect(cleanPEMString(privateKeyPem)).toBe(cleanPEMString(CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_PRIVATE_KEY_PEM));
  });

  it('getPublicKeyFromSignature', async () => {
    const workerFileContent = await getWorkerContent();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(workerFileContent),
      } as Response),
    );

    const resp = await getPublicKeyFromSignature(SAMPLE_CTX, Buffer.from(CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_ENCRYPTION_KEY));

    expect(resp).toBe(CRYPTOGRAPHY_UTILS_TEST_VARS.SIGNATURE_PUBLIC_KEY_HEX);
  }, 20000);

  it('symmetricKeyEncryptMessage', async () => {
    const resp = await symmetricKeyEncryptMessage(CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_STRING);

    expect(resp.encryptedMessageHex).toBeDefined();
    expect(resp.key).toBeDefined();
  });

  it('decryptWithKeyPair', async () => {
    const encrypted = encryptWithDerivedPublicKey(getPublicKeyHex(testKeyPair), CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_STRING);

    const resp = decryptWithKeyPair(testKeyPair, encrypted.encryptedMessageHex, encrypted.encryptedKeyHex);
    expect(resp).toBe(CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_STRING);
  });

  it('decryptWithPrivateKey', async () => {
    const encrypted = encryptWithDerivedPublicKey(getPublicKeyHex(testKeyPair), CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_STRING);

    const resp = decryptWithPrivateKey(testKeyPair.privateKey, encrypted.encryptedMessageHex, encrypted.encryptedKeyHex);

    expect(resp).toBe(CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_STRING);
  });

  it('getDerivedPrivateKeyAndDecrypt', async () => {
    const workerFileContent = await getWorkerContent();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(workerFileContent),
      } as Response),
    );

    const encrypted = encryptWithDerivedPublicKey(getPublicKeyHex(testKeyPair), CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_STRING);

    const resp = await getDerivedPrivateKeyAndDecrypt(
      SAMPLE_CTX,
      getSHA256HashHex(CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_KEY_PAIR_SEED),
      [
        {
          walletId: '1',
          walletScheme: WalletScheme.DKLS,
          encryptedShare: encrypted.encryptedMessageHex,
          encryptedKey: encrypted.encryptedKeyHex,
        },
      ],
    );

    expect(resp).toBeDefined();
  });

  describe('decryptPrivateKeyAndDecryptShare', () => {
    it('pass', async () => {
      const workerFileContent = await getWorkerContent();

      global.fetch = vi.fn(() =>
        Promise.resolve({
          text: () => Promise.resolve(workerFileContent),
        } as Response),
      );

      const encrypted = encryptWithDerivedPublicKey(getPublicKeyHex(testKeyPair), CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_STRING);

      const resp = await decryptPrivateKeyAndDecryptShare(
        CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_ENCRYPTION_KEY,
        [
          {
            walletId: '1',
            walletScheme: WalletScheme.DKLS,
            encryptedShare: encrypted.encryptedMessageHex,
            encryptedKey: encrypted.encryptedKeyHex,
          },
        ],
        CRYPTOGRAPHY_UTILS_TEST_VARS.ENCRYPT_PRIVATE_KEY_RESP,
      );

      expect(resp[0].signer).toBe(CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_STRING);
    });

    it('fail', async () => {
      const workerFileContent = await getWorkerContent();

      global.fetch = vi.fn(() =>
        Promise.resolve({
          text: () => Promise.resolve(workerFileContent),
        } as Response),
      );

      const encrypted = encryptWithDerivedPublicKey(getPublicKeyHex(testKeyPair), CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_STRING);

      await expect(
        decryptPrivateKeyAndDecryptShare(
          'INVALID KEY',
          [
            {
              walletId: '1',
              walletScheme: WalletScheme.DKLS,
              encryptedShare: encrypted.encryptedMessageHex,
              encryptedKey: encrypted.encryptedKeyHex,
            },
          ],
          CRYPTOGRAPHY_UTILS_TEST_VARS.ENCRYPT_PRIVATE_KEY_RESP,
        ),
      ).rejects.toThrow('Could not decrypt private key');
    });
  });

  it('encryptWithDerivedPublicKey', () => {
    const resp = encryptWithDerivedPublicKey(getPublicKeyHex(testKeyPair), CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_STRING);

    expect(resp.encryptedMessageHex).toBeDefined();
    expect(resp.encryptedKeyHex).toBeDefined();
  });

  it('hashPasswordWithSalt', () => {
    const resp = hashPasswordWithSalt(CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_STRING);

    expect(resp.salt).toBeDefined();
    expect(resp.hash).toBeDefined();
  });

  it('encryptPrivateKeyWithPassword', async () => {
    const resp = await encryptPrivateKeyWithPassword(testKeyPair, CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_PASSWORD_HASH);

    expect(resp).toBe(CRYPTOGRAPHY_UTILS_TEST_VARS.ENCRYPT_PRIVATE_KEY_PASSWORD_RESP);
  });

  it('decryptPrivateKeyWithPassword', async () => {
    const encryptedPrivateKey = await encryptPrivateKeyWithPassword(
      testKeyPair,
      CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_PASSWORD_HASH,
    );
    const resp = await decryptPrivateKeyWithPassword(encryptedPrivateKey, CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_PASSWORD_HASH);
    const privateKeyPem = forge.pki.privateKeyToPem(resp);

    expect(cleanPEMString(privateKeyPem)).toBe(cleanPEMString(CRYPTOGRAPHY_UTILS_TEST_VARS.TEST_PRIVATE_KEY_PEM));
  });
});
