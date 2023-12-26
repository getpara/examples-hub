import { randomBytes } from 'crypto';
import { Encrypt as ECIESEncrypt, Decrypt as ECIESDecrypt } from '@celo/utils/lib/ecies';
import { Buffer } from 'buffer';
import * as eutil from '@ethereumjs/util';
import Client from '@usecapsule/user-management-client';

export async function upload(message: string, userManagementClient: Client) {
  let secret: string;
  let publicKeyUint8Array: Uint8Array;
  while (true) {
    try {
      secret = randomBytes(32).toString('hex');
      // privateToPublic throws error when private key is larger than group order
      // so we want to keep trying until we get a valid private key
      publicKeyUint8Array = eutil.privateToPublic(Buffer.from(secret, 'hex'));
      break;
    } catch (e) {
      continue;
    }
  }

  const pubkey = Buffer.from(publicKeyUint8Array);
  const data = ECIESEncrypt(pubkey, Buffer.from(message, 'ucs2')).toString(
    'base64',
  );

  const {
    data: { id },
  } = await userManagementClient.tempTrasmissionInit(data);

  return encodeURIComponent(id + '|' + secret);
}

export async function retrieve(uriEncodedMessage: string, userManagementClient: Client) {
  const [id, secret] = decodeURIComponent(uriEncodedMessage).split('|');
  const response = await userManagementClient.tempTrasmission(
    id as string,
  );
  const data = response.data.message;
  const buf = Buffer.from(data as string, 'base64');
  const res = ECIESDecrypt(Buffer.from(secret as string, 'hex'), buf).toString(
    'ucs2',
  );
  return res;
}
