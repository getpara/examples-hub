import { randomBytes } from 'crypto';
import { ec as EC } from 'elliptic';
import { Encrypt as ECIESEncrypt } from '@celo/utils/lib/ecies';
import { Capsule } from '../Capsule';
import { Buffer } from 'buffer';
import { ECIESDecrypt } from '../shares/KeyContainer';

export async function upload(message: string, capsule: Capsule) {
  const secret = randomBytes(32).toString('hex');
  const ec = new EC('secp256k1');
  const privKey = ec.keyFromPrivate(Buffer.from(secret, 'hex'));
  const pubKey = privKey.getPublic(false, 'hex');
  const publicKey = Buffer.from(pubKey, 'hex');
  const pubkey = Buffer.from(
    ec.keyFromPublic(publicKey).getPublic(false, 'hex'),
    'hex',
  ).subarray(1);
  const data = ECIESEncrypt(pubkey, Buffer.from(message, 'ucs2')).toString(
    'base64',
  );

  const {
    data: { id },
  // @ts-ignore
  } = await capsule.ctx.capsuleClient.tempTrasmissionInit(data);

  return id + '|' + secret;
}

export async function retrieve(message: string, capsule: Capsule) {
  const [id, secret] = message.split('|');
  // @ts-ignore
  const response = await capsule.ctx.capsuleClient.tempTrasmission(
    id as string,
  );
  const data = response.data.message;
  const buf = Buffer.from(data as string, 'base64');
  const res = ECIESDecrypt(Buffer.from(secret as string, 'hex'), buf).toString(
    'ucs2',
  );
  return res;
}
