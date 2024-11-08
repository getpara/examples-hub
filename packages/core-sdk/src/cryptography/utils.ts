import base64url from 'base64url';
import forge from 'node-forge';
import { Ctx, getPortalBaseURL } from '../definitions.js';

interface EncryptedShare {
  walletId: string;
  walletScheme: string;
  encryptedShare: string;
  encryptedKey: string;
  partnerId?: string;
}

const rsa = forge.pki.rsa;
const RSA_ENCRYPTION_SCHEME = 'RSA-OAEP';
// ivs can be constant only because every key is only ever used to encrypt one message
const CONSTANT_IV = '794241bc819a125a7b78ea313decc0bc';
const CONSTANT_IV_AES = new Uint8Array([23, 66, 157, 146, 179, 158, 117, 120, 184, 73, 123, 81]);

export function getSHA256HashHex(str: string): string {
  const md = forge.md.sha256.create();
  md.update(str);
  return md.digest().toHex();
}

export function getPublicKeyHex(keyPair: forge.pki.rsa.KeyPair): string {
  const pem = forge.pki.publicKeyToRSAPublicKeyPem(keyPair.publicKey);
  return Buffer.from(pem, 'utf-8').toString('hex');
}

export function publicKeyFromHex(publicKeyHex: string): forge.pki.rsa.PublicKey {
  const pem = publicKeyHexToPem(publicKeyHex);
  return forge.pki.publicKeyFromPem(pem);
}

export function publicKeyHexToPem(publicKeyHex: string): string {
  return Buffer.from(publicKeyHex, 'hex').toString('utf-8');
}

export function encodePrivateKeyToPemHex(keyPair: forge.pki.rsa.KeyPair): string {
  const pem = forge.pki.privateKeyToPem(keyPair.privateKey);
  return Buffer.from(pem, 'utf-8').toString('hex');
}

export function decodePrivateKeyPemHex(privateKeyPemHex: string): forge.pki.rsa.PrivateKey {
  const pem = Buffer.from(privateKeyPemHex, 'hex').toString('utf-8');
  return forge.pki.privateKeyFromPem(pem);
}

export async function encryptPrivateKey(keyPair: forge.pki.rsa.KeyPair, key: string): Promise<string> {
  const privateKeyPemHex = encodePrivateKeyToPemHex(keyPair);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    Buffer.from(key, 'base64'),
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
  const encodedPlaintext = new TextEncoder().encode(privateKeyPemHex);
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: CONSTANT_IV_AES },
    cryptoKey,
    encodedPlaintext,
  );
  return Buffer.from(ciphertext).toString('base64');
}

export async function decryptPrivateKey(encryptedPrivateKeyPemHex: string, key: string): Promise<forge.pki.rsa.PrivateKey> {
  const secretKey = await crypto.subtle.importKey(
    'raw',
    Buffer.from(key, 'base64'),
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
  const cleartext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: CONSTANT_IV_AES },
    secretKey,
    Buffer.from(encryptedPrivateKeyPemHex, 'base64'),
  );
  const privateKeyPemHex = new TextDecoder().decode(cleartext);
  const privateKey = decodePrivateKeyPemHex(privateKeyPemHex);
  return privateKey;
}

export async function getAsymmetricKeyPair(ctx: Ctx, seedValue?: string): Promise<forge.pki.rsa.KeyPair> {
  const prng = forge.random.createInstance();
  if (seedValue) {
    prng.seedFileSync = (_n: number) => seedValue;
    prng.seedFile = (_n: number, cb: forge.random.CB) => {
      cb(null, seedValue);
    };
  }

  const options: forge.pki.rsa.GenerateKeyPairOptions = {
    bits: 2048,
    e: 65537,
    prng,
  };
  if (!ctx.disableWorkers) {
    options.workLoad = 100;
    // only using 1 web worker as more makes the call non-deterministic
    // -1 uses optimal amount of web workers
    options.workers = seedValue ? 1 : -1;

    const workerRes = await fetch(`${getPortalBaseURL(ctx)}/static/js/prime.worker.min.js`);
    const workerBlob = new Blob([await workerRes.text()], { type: 'application/javascript' });
    options.workerScript = URL.createObjectURL(workerBlob);
  }

  return new Promise((resolve, reject) =>
    rsa.generateKeyPair(options, (err, keypair) => {
      if (err) {
        reject(err);
      }
      resolve(keypair);
    }),
  );
}

export async function getPublicKeyFromSignature(ctx: Ctx, userHandle: Uint8Array): Promise<string> {
  const encodedUserHandle = base64url.encode(userHandle as any);
  const keyPair = await getAsymmetricKeyPair(ctx, encodedUserHandle);
  return getPublicKeyHex(keyPair);
}

// only use for one time key encryptions as iv is constant
export function symmetricKeyEncryptMessage(message: string): {
  key: string;
  encryptedMessageHex: string;
} {
  const key = forge.random.getBytesSync(16);
  const cipher = forge.cipher.createCipher('AES-CBC', key);

  // iv can be constant only because every key is only ever used to encrypt one message
  cipher.start({ iv: CONSTANT_IV });
  cipher.update(forge.util.createBuffer(message));
  cipher.finish();
  const encryptedMessageHex = cipher.output.toHex();

  return { key, encryptedMessageHex };
}

function decipherEncryptedMessageHex(key: string, encryptedMessageHex: string): string {
  const decipher = forge.cipher.createDecipher('AES-CBC', key);
  // iv can be constant only because every key is only ever used to encrypt one message
  decipher.start({ iv: CONSTANT_IV });
  decipher.update(forge.util.createBuffer(forge.util.hexToBytes(encryptedMessageHex)));
  decipher.finish();
  return decipher.output.toString();
}

// Deprecated in favor of decryptWithPrivateKey
export function decryptWithKeyPair(
  keyPair: forge.pki.rsa.KeyPair,
  encryptedMessageHex: string,
  encryptedKeyHex: string,
): string {
  const encryptedKey = Buffer.from(encryptedKeyHex, 'hex').toString('utf-8');
  const key = keyPair.privateKey.decrypt(encryptedKey, RSA_ENCRYPTION_SCHEME);

  return decipherEncryptedMessageHex(key, encryptedMessageHex);
}

export function decryptWithPrivateKey(
  privateKey: forge.pki.rsa.PrivateKey,
  encryptedMessageHex: string,
  encryptedKeyHex: string,
): string {
  const encryptedKey = Buffer.from(encryptedKeyHex, 'hex').toString('utf-8');
  const key = privateKey.decrypt(encryptedKey, RSA_ENCRYPTION_SCHEME);

  return decipherEncryptedMessageHex(key, encryptedMessageHex);
}

async function decryptWithDerivedPrivateKey(
  ctx: Ctx,
  seedValue: string,
  encryptedMessageHex: string,
  encryptedKeyHex: string,
): Promise<string> {
  const keyPair = await getAsymmetricKeyPair(ctx, seedValue);
  return decryptWithPrivateKey(keyPair.privateKey, encryptedMessageHex, encryptedKeyHex);
}

export async function getDerivedPrivateKeyAndDecrypt(
  ctx: Ctx,
  seedValue: string,
  encryptedShares: EncryptedShare[],
): Promise<{ walletId: string; walletScheme: string; signer: string; partnerId }[]> {
  return Promise.all(
    encryptedShares.map(async share => ({
      walletId: share.walletId,
      walletScheme: share.walletScheme,
      partnerId: share.partnerId,
      signer: await decryptWithDerivedPrivateKey(ctx, seedValue, share.encryptedShare, share.encryptedKey),
    })),
  );
}

export async function decryptPrivateKeyAndDecryptShare(
  encryptionKey: string,
  encryptedShares: EncryptedShare[],
  encryptedPrivateKey: string,
): Promise<{ walletId: string; walletScheme: string; signer: string; partnerId: string }[]> {
  let privateKey;

  try {
    privateKey = await decryptPrivateKey(encryptedPrivateKey, encryptionKey);
  } catch (e) {}

  try {
    privateKey = await decryptPrivateKeyWithPassword(encryptedPrivateKey, encryptionKey);
  } catch (e) {}

  if (!privateKey) {
    throw new Error('Could not decrypt private key');
  }

  return encryptedShares.map(share => ({
    walletId: share.walletId,
    walletScheme: share.walletScheme,
    partnerId: share.partnerId,
    signer: decryptWithPrivateKey(privateKey, share.encryptedShare, share.encryptedKey),
  }));
}

export function encryptWithDerivedPublicKey(
  publicKeyHex: string,
  message: string,
): {
  encryptedMessageHex: string;
  encryptedKeyHex: string;
} {
  const { key, encryptedMessageHex } = symmetricKeyEncryptMessage(message);

  const publicKeyPem = publicKeyHexToPem(publicKeyHex);
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encryptedKey = publicKey.encrypt(key, RSA_ENCRYPTION_SCHEME);
  const encryptedKeyHex = Buffer.from(encryptedKey, 'utf-8').toString('hex');

  return { encryptedMessageHex, encryptedKeyHex };
}

export function hashPasswordWithSalt(password: string): { salt: string; hash: string } {
  const salt = generateSalt();
  const saltedPassword = salt + password;
  const hash = getSHA256HashHex(saltedPassword);
  return { salt, hash };
}

function generateSalt(length: number = 16): string {
  return forge.util.bytesToHex(forge.random.getBytesSync(length));
}

async function deriveCryptoKeyFromPassword(hashedPassword: string): Promise<CryptoKey> {
  const keyBuffer = Buffer.from(hashedPassword, 'hex');
  return await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptPrivateKeyWithPassword(
  keyPair: forge.pki.rsa.KeyPair,
  hashedPassword: string,
): Promise<string> {
  const cryptoKey = await deriveCryptoKeyFromPassword(hashedPassword);
  const privateKeyPemHex = encodePrivateKeyToPemHex(keyPair);
  const encodedPlaintext = new TextEncoder().encode(privateKeyPemHex);
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: CONSTANT_IV_AES },
    cryptoKey,
    encodedPlaintext,
  );
  return Buffer.from(ciphertext).toString('base64');
}

export async function decryptPrivateKeyWithPassword(
  encryptedPrivateKeyPemHex: string,
  hashedPassword: string,
): Promise<forge.pki.rsa.PrivateKey> {
  const secretKey = await crypto.subtle.importKey(
    'raw',
    Buffer.from(hashedPassword, 'hex'),
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
  const cleartext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: CONSTANT_IV_AES },
    secretKey,
    Buffer.from(encryptedPrivateKeyPemHex, 'base64'),
  );
  const privateKeyPemHex = new TextDecoder().decode(cleartext);
  const privateKey = decodePrivateKeyPemHex(privateKeyPemHex);
  return privateKey;
}
