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
