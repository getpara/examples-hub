import { ModalBuilderConfig } from '../types';
import { compressToEncodedURIComponent as lzEnc, decompressFromEncodedURIComponent as lzDec } from 'lz-string';

export function encodeConfig(diff: Partial<ModalBuilderConfig>): string {
  const jsonStr = JSON.stringify(diff);
  const encoded = lzEnc(jsonStr);
  return encoded;
}

export function decodeConfig(encoded: string): Partial<ModalBuilderConfig> | null {
  if (!encoded) return null;

  try {
    const decoded = lzDec(encoded);
    if (!decoded) return null;

    const parsed = JSON.parse(decoded) as Partial<ModalBuilderConfig>;
    return parsed;
  } catch (e) {
    console.error('[decodeConfig] Error:', e);
    return null;
  }
}

export const compressConfigDiff = (diff: Partial<ModalBuilderConfig>) => diff;
export const decompressConfigDiff = (compressed: any) => compressed;
export const encodeCompressedConfig = encodeConfig;
export const decodeCompressedConfig = decodeConfig;
