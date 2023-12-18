import { randomBytes } from 'crypto';
import { Encrypt as ECIESEncrypt, Decrypt as ECIESDecrypt } from '@celo/utils/lib/ecies';
import { Buffer } from 'buffer';
import * as eutil from 'ethereumjs-util';
import Client from '@usecapsule/user-management-client';

export async function upload(message: string, userManagementClient: Client) {
  const secret = randomBytes(32).toString('hex');
  const pubkey = Buffer.from(eutil.privateToPublic(Buffer.from(secret, 'hex')));
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
