import { randomBytes } from 'crypto';
import { ec as EC } from 'elliptic';
import { Encrypt as ECIESEncrypt } from '@celo/utils/lib/ecies';
import { Buffer } from 'buffer';
import { ECIESDecrypt } from '../shares/KeyContainer';
import Client from '@usecapsule/user-management-client';

export async function upload(message: string, userManagementClient: Client) {
  const secret = randomBytes(32).toString('hex');
  const ec = new EC('secp256k1');
  const privKey = ec.keyFromPrivate(Buffer.from(secret, 'hex'));
  const pubKey = privKey.getPublic(false, 'hex');
  const publicKey = Buffer.from(pubKey, 'hex');
  const pubkey = Buffer.from(
    ec.keyFromPublic(publicKey).getPublic(false, 'hex'),
    'hex',
  ).subarray(1);
  const data = ECIESEncrypt(Buffer.from(pubkey), Buffer.from(message, 'ucs2')).toString(
    'base64',
  );

  const {
    data: { id },
  // @ts-ignore
  } = await userManagementClient.tempTrasmissionInit(data);

  return encodeURIComponent(id + '|' + secret);
}

export async function retrieve(uriEncodedMessage: string, userManagementClient: Client) {
  const [id, secret] = decodeURIComponent(uriEncodedMessage).split('|');
  // @ts-ignore
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
