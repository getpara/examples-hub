import base64url from 'base64url';
import * as cbor from 'cbor-web';

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

function COSEECDHAtoPKCS(COSEPublicKey: Buffer): Buffer {
  const coseStruct = cbor.decodeAllSync(COSEPublicKey)[0];
  const tag = Buffer.from([0x04]);
  const x = coseStruct.get(-2);
  const y = coseStruct.get(-3);

  return Buffer.concat([tag, x, y]);
}

export function parseCredentialCreationRes(creds: any): {
  cosePublicKey: string;
  clientDataJSON: string;
} {
  const parsedAttestation = parseAttestationObject(
    creds.response.attestationObject
  );
  const { COSEPublicKey } = parseMakeCredAuthData(parsedAttestation.authData);

  return {
    cosePublicKey: base64url.encode(COSEECDHAtoPKCS(COSEPublicKey)),
    clientDataJSON: creds.response.clientDataJSON,
  };
}

// generate a random 16 byte user handle
function generateUserHandle() {
  // constant user handle for localhost to not create many creds
  if (window.location.hostname === 'localhost') {
    return new Uint8Array(16)
  }
  const userHandle = new Uint8Array(16)
  // uncomment when we want to use real user handles
  // window.crypto.getRandomValues(userHandle)
  return userHandle
}

export async function createCredential(userId: string, email: string): Promise<{
  creds: any,
  userHandle: Uint8Array,
}> {
  const userHandle = generateUserHandle()
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
        { type: 'public-key' as any, alg: -7 },
        // may need this for windows hello or similar browsers
        // TODO: test if windows hello works with above or if we need below alg
        // { type: "public-key", alg: -257 },
      ],
      attestation: 'direct' as any,
      timeout: 60000,
      // TODO: don't think we really get value from verifying this, but should revisit
      challenge: Buffer.from(userId, 'utf-8'),
    },
  }

  const credential = await navigator.credentials.create(
    createCredentialDefaultArgs
  )
  return {
    creds: publicKeyCredentialToJSON(credential),
    userHandle,
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
