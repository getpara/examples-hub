export type Hex = `0x${string}`;
export interface Signature {
  r: Hex;
  s: Hex;
  v: bigint;
};

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
