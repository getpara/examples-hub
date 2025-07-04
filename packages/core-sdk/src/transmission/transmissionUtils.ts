import { Buffer } from 'buffer';
import Client from '@getpara/user-management-client';
import { randomBytes } from 'crypto';
import { PrivateKey, decrypt, encrypt } from 'eciesjs';

export async function upload(message: string, userManagementClient: Client) {
  let secret: string;
  let publicKeyUint8Array: Uint8Array;
  let error: Error | null = null;
  for (let i = 0; i < 20; i++) {
    try {
      secret = randomBytes(32).toString('hex');
      // PrivateKey.fromHex throws error when private key is larger than group order
      // so we want to keep trying until we get a valid private key
      publicKeyUint8Array = PrivateKey.fromHex(secret).publicKey.toBytes(true);
      break;
    } catch (e) {
      error = e as Error;
      continue;
    }
  }
  if (!publicKeyUint8Array) {
    throw new Error('Failed to generate public key: ' + error?.message);
  }

  const data = Buffer.from(
    encrypt(Buffer.from(publicKeyUint8Array).toString('hex'), new Uint8Array(Buffer.from(message, 'ucs2'))),
  ).toString('base64');

  const {
    data: { id },
  } = await userManagementClient.tempTrasmissionInit(data);

  return encodeURIComponent(id + '|' + secret);
}

export async function retrieve(uriEncodedMessage: string, userManagementClient: Client) {
  const [id, secret] = decodeURIComponent(uriEncodedMessage).split('|');
  const response = await userManagementClient.tempTrasmission(id as string);
  const data = response.data.message;
  const buf = Buffer.from(data as string, 'base64');
  const res = Buffer.from(decrypt(secret, new Uint8Array(buf))).toString('ucs2');
  return res;
}
