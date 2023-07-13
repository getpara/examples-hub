import base64url from 'base64url';
import * as cbor from 'cbor-web';
import forge from 'node-forge';

import { Environment } from '../definitions';

const ES256_ALGORITHM = -7;
const RS256_ALGORITHM = -257;

function publicKeyCredentialToJSON(
  // eslint-disable-next-line @typescript-eslint/ban-types
  pubKeyCred: ArrayBuffer | Array<string> | Object
) {
  if (pubKeyCred instanceof ArrayBuffer) {
    return base64url.encode(pubKeyCred as any);
  } else if (pubKeyCred instanceof Array) {
    return pubKeyCred.map(publicKeyCredentialToJSON);
  } else if (pubKeyCred instanceof Object) {
    const obj = {};
    for (const key in pubKeyCred) {
      obj[key] = publicKeyCredentialToJSON(pubKeyCred[key]);
    }
    return obj;
  } else return pubKeyCred;
}

function parseMakeCredAuthData(buffer: Buffer) {
  const rpIdHash = buffer.slice(0, 32);
  buffer = buffer.slice(32);

  const flagsBuf = buffer.slice(0, 1);
  buffer = buffer.slice(1);

  const flags = flagsBuf[0];

  const counterBuf = buffer.slice(0, 4);
  buffer = buffer.slice(4);

  const counter = counterBuf.readUInt32BE(0);

  const aaguid = buffer.slice(0, 16);
  buffer = buffer.slice(16);

  const credIDLenBuf = buffer.slice(0, 2);
  buffer = buffer.slice(2);

  const credIDLen = credIDLenBuf.readUInt16BE(0);

  const credID = buffer.slice(0, credIDLen);
  buffer = buffer.slice(credIDLen);

  const COSEPublicKey = buffer;

  return {
    rpIdHash,
    flagsBuf,
    flags,
    counter,
    counterBuf,
    aaguid,
    credID,
    COSEPublicKey,
  };
}

function parseAttestationObject(attestationObject: string): any {
  const attestationObjectBuffer = base64url.toBuffer(attestationObject);
  return cbor.decodeAllSync(attestationObjectBuffer)[0];
}

function COSEECDSAtoPKCS(COSEPublicKey: Buffer): Buffer {
  const coseStruct = cbor.decodeAllSync(COSEPublicKey)[0];
  const tag = Buffer.from([0x04]);
  const x = coseStruct.get(-2);
  const y = coseStruct.get(-3);

  return Buffer.concat([tag, x, y]);
}

function COSERSAtoPKCS(COSEPublicKey: Buffer): Buffer {
  const coseStruct = cbor.decodeAllSync(COSEPublicKey)[0];
  const n = coseStruct.get(-1);
  const e = coseStruct.get(-2);

  // Convert to Forge's format:
  const nForge = forge.util.createBuffer(n.toString('binary'));
  const eForge = forge.util.createBuffer(e.toString('binary'));

  // Create a new public key object:
  const publicKey = forge.pki.setRsaPublicKey(
    new forge.jsbn.BigInteger(nForge.toHex(), 16),
    new forge.jsbn.BigInteger(eForge.toHex(), 16)
  );

  // Export as a PKCS#1 public key buffer:
  return Buffer.from(forge.pki.publicKeyToPem(publicKey), 'utf-8');
}

export function parseCredentialCreationRes(creds: any, algorithm: number): {
  cosePublicKey: string;
  clientDataJSON: string;
} {
  const parsedAttestation = parseAttestationObject(
    creds.response.attestationObject
  );
  const { COSEPublicKey } = parseMakeCredAuthData(parsedAttestation.authData);

  if (algorithm === RS256_ALGORITHM) {
    return {
      cosePublicKey: base64url.encode(COSERSAtoPKCS(COSEPublicKey)),
      clientDataJSON: creds.response.clientDataJSON,
    };
  }

  return {
    cosePublicKey: base64url.encode(COSEECDSAtoPKCS(COSEPublicKey)),
    clientDataJSON: creds.response.clientDataJSON,
  };
}

// generate a random 16 byte user handle
function generateUserHandle(env: Environment) {
  // constant user handle for non-prod to not create many creds
  const userHandle = new Uint8Array(16)
  if (env === Environment.PROD) {
    window.crypto.getRandomValues(userHandle)
  }
  return userHandle
}

export async function createCredential(env: Environment, userId: string, email: string): Promise<{
  creds: any,
  userHandle: Uint8Array,
  algorithm: number,
}> {
  const userHandle = generateUserHandle(env)
  const createCredentialDefaultArgs = {
    publicKey: {
      authenticatorSelection: {
        authenticatorAttachment: 'platform' as any,
        requireResidentKey: true,
        residentKey: 'required' as any,
        userVerification: 'required' as any,
      },
      rp: {
        name: 'Capsule',
      },
      user: {
        id: userHandle,
        name: email + '-webauthn',
        displayName: email,
      },
      pubKeyCredParams: [
        { type: 'public-key' as PublicKeyCredentialType, alg: ES256_ALGORITHM },
        // RS256_ALGORITHM should only be needed for windows hello
        { type: 'public-key' as PublicKeyCredentialType, alg: RS256_ALGORITHM },
      ],
      attestation: 'direct' as any,
      timeout: 60000,
      // TODO: don't think we really get value from verifying this, but should revisit
      challenge: Buffer.from(userId, 'utf-8'),
    },
  };

  const credential = await navigator.credentials.create(createCredentialDefaultArgs);

  return {
    creds: publicKeyCredentialToJSON(credential),
    userHandle,
    algorithm: ((credential as PublicKeyCredential).response as AuthenticatorAttestationResponse).getPublicKeyAlgorithm(),
  }
}

export async function generateSignature(challenge: string, allowedPublicKeys: string[]) {
  const getCredentialDefaultArgs = {
    publicKey: {
      timeout: 60000,
      challenge: Buffer.from(challenge, 'base64'),
      allowCredentials: allowedPublicKeys.map((key) => ({
        id: base64url.toBuffer(key),
        type: 'public-key',
      })),
      userVerification: 'required',
    },
  } as CredentialRequestOptions;

  const assertation = await navigator.credentials.get(getCredentialDefaultArgs);
  return publicKeyCredentialToJSON(assertation);
}
