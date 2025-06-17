import { toBech32 } from '@cosmjs/encoding';
import { sha256 } from '@noble/hashes/sha256';
import { ripemd160 } from '@noble/hashes/ripemd160';

import elliptic from 'elliptic';
import { TWalletType } from '@getpara/user-management-client';

const secp256k1 = new elliptic.ec('secp256k1');

export type Hex = `0x${string}`;
export interface Signature {
  r: Hex;
  s: Hex;
  v: bigint;
}

export function hexStringToBase64(hexString: string): string {
  if (hexString.substring(0, 2) === '0x') {
    hexString = hexString.substring(2);
  }
  return Buffer.from(hexString, 'hex').toString('base64');
}

export function hexToSignature(hexSig: string): Signature {
  return {
    r: `0x${hexSig.slice(2, 66)}`,
    s: `0x${hexSig.slice(66, 130)}`,
    v: BigInt(hexSig.slice(130, 132)),
  };
}

export function hexToUint8Array(hex: string): Uint8Array {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }
  return new Uint8Array(Buffer.from(hex, 'hex'));
}

export function hexToDecimal(hex: string): string {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }
  return `${parseInt(hex, 16)}`;
}

export function decimalToHex(decimal: string): Hex {
  return `0x${parseInt(decimal).toString(16)}`;
}

export function compressPubkey(pubkey: Uint8Array): Uint8Array {
  switch (pubkey.length) {
    case 33:
      return pubkey;
    case 65:
      return Uint8Array.from(secp256k1.keyFromPublic(pubkey).getPublic(true, 'array'));
    default:
      throw new Error('Invalid pubkey length');
  }
}

export function rawSecp256k1PubkeyToRawAddress(pubkeyData: Uint8Array): Uint8Array {
  if (pubkeyData.length !== 33) {
    throw new Error(`Invalid Secp256k1 pubkey length (compressed): ${pubkeyData.length}`);
  }
  return ripemd160(sha256(pubkeyData));
}

export function getCosmosAddress(publicKey: string, prefix: string) {
  const uncompressedPublicKey = new Uint8Array(
    Buffer.from(publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey, 'hex'),
  );
  const compressedPublicKey = compressPubkey(uncompressedPublicKey);

  return toBech32(prefix, rawSecp256k1PubkeyToRawAddress(compressedPublicKey));
}

export function truncateAddress(
  str: string,
  addressType: TWalletType,
  {
    prefix = addressType === 'COSMOS' ? 'cosmos' : undefined,
    targetLength,
  }: { prefix?: string; targetLength?: number } = {},
): string {
  const minimum = addressType === 'COSMOS' ? prefix.length : addressType === 'EVM' ? 2 : 0;
  const margin = targetLength !== undefined ? (targetLength - minimum) / 2 : 4;

  return `${str.slice(0, minimum + margin)}...${str.slice(-1 * margin)}`;
}
