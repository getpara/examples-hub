import base64url from 'base64url'
import forge from 'node-forge';
import { Ctx, getPortalBaseURL } from '../definitions.js';

interface EncryptedShare {
  walletId: string;
  encryptedShare: string;
  encryptedKey: string;
}

const rsa = forge.pki.rsa;
const RSA_ENCRYPTION_SCHEME = 'RSA-OAEP';
// iv can be constant only because every key is only ever used to encrypt one message
const CONSTANT_IV = '794241bc819a125a7b78ea313decc0bc';

export function getSHA256HashHex(str: string): string {
  const md = forge.md.sha256.create();
  md.update(str);
  return md.digest().toHex();
}

export function getPublicKeyHex(keyPair: forge.pki.rsa.KeyPair): string {
  const pem = forge.pki.publicKeyToRSAPublicKeyPem(keyPair.publicKey);
  return Buffer.from(pem, 'utf-8').toString('hex');
}

function publicKeyHexToPem(publicKeyHex: string): string {
  return Buffer.from(publicKeyHex, 'hex').toString('utf-8');
}

export async function getAsymmetricKeyPair(
  ctx: Ctx,
  seedValue?: string,
  keypairCallback: boolean = true,
): Promise<forge.pki.rsa.KeyPair> {
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

  const keyPair = keypairCallback ? await new Promise<forge.pki.rsa.KeyPair>((resolve, reject) => {
    rsa.generateKeyPair(options, (err, keyPair) => {
      if (err) {
        reject(err);
      } else {
        resolve(keyPair);
      }
    });
  }
  ) : rsa.generateKeyPair(options);

  return keyPair;
}

export async function getPublicKeyFromSignature(
  ctx: Ctx,
  userHandle: Uint8Array,
): Promise<string> {
  const encodedUserHandle = base64url.encode(userHandle as any)
  const keyPair = await getAsymmetricKeyPair(ctx, encodedUserHandle);
  return getPublicKeyHex(keyPair)
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

export function decryptWithPrivateKey(
  privateKey: forge.pki.rsa.PrivateKey,
  encryptedMessageHex: string,
  encryptedKeyHex: string
): string {
  const encryptedKey = Buffer.from(encryptedKeyHex, 'hex').toString('utf-8');
  const key = privateKey.decrypt(encryptedKey, RSA_ENCRYPTION_SCHEME);

  const decipher = forge.cipher.createDecipher('AES-CBC', key);
  // iv can be constant only because every key is only ever used to encrypt one message
  decipher.start({ iv: CONSTANT_IV });
  decipher.update(
    forge.util.createBuffer(forge.util.hexToBytes(encryptedMessageHex))
  );
  decipher.finish();
  return decipher.output.toString();
}

async function decryptWithDerivedPrivateKey(ctx: Ctx, seedValue: string, encryptedMessageHex: string, encryptedKeyHex: string): Promise<string> {
  try {
    const keyPair = await getAsymmetricKeyPair(ctx, seedValue);
    return decryptWithPrivateKey(keyPair.privateKey, encryptedMessageHex, encryptedKeyHex);
  } catch {}

  try {
    const keyPair = await getAsymmetricKeyPair(ctx, seedValue, false);
    return decryptWithPrivateKey(keyPair.privateKey, encryptedMessageHex, encryptedKeyHex);
  } catch {}

  const privateKeyPem = Buffer.from(seedValue, 'hex').toString('utf-8');
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  return decryptWithPrivateKey(privateKey, encryptedMessageHex, encryptedKeyHex);
}

export async function getDerivedPrivateKeyAndDecrypt(
  ctx: Ctx,
  seedValue: string,
  encryptedShares: EncryptedShare[]
): Promise<{ walletId: string; signer: string }[]> {
  const walletIdSignerPairs = [];
  for (const share of encryptedShares) {
    const signer = await decryptWithDerivedPrivateKey(
      ctx,
      seedValue,
      share.encryptedShare,
      share.encryptedKey
    );
    walletIdSignerPairs.push({ walletId: share.walletId, signer: signer });
  }
  return walletIdSignerPairs;
}

export function encryptWithDerivedPublicKey(
  publicKeyHex: string,
  message: string
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
