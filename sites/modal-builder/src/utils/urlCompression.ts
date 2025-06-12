import { ModalBuilderConfig } from '../types';
import { compressToEncodedURIComponent as lzEnc, decompressFromEncodedURIComponent as lzDec } from 'lz-string';
import { KEY_MAP, REVERSE_KEY_MAP, VALUE_MAPS, REVERSE_VALUE_MAPS } from './compressionMaps';

function compressValue(value: any, category?: string): any {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(item => compressValue(item, category));
  if (typeof value === 'object') return compressObject(value);
  if (category && VALUE_MAPS[category] && value in VALUE_MAPS[category]) return VALUE_MAPS[category][value];
  if (typeof value === 'boolean') return value ? 1 : 0;
  return value;
}

function decompressValue(value: any, category?: string): any {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(item => decompressValue(item, category));
  if (category && REVERSE_VALUE_MAPS[category] && value in REVERSE_VALUE_MAPS[category])
    return REVERSE_VALUE_MAPS[category][value];
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;
  return value;
}

function compressObject(obj: Record<string, any>): Record<string, any> {
  const compressed: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const shortKey = KEY_MAP[key] ?? key;
    compressed[shortKey] = compressValue(value, key);
  }
  return compressed;
}

function decompressObject(obj: Record<string, any>): Record<string, any> {
  const decompressed: Record<string, any> = {};
  for (const [shortKey, value] of Object.entries(obj)) {
    const fullKey = REVERSE_KEY_MAP[shortKey] ?? shortKey;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      decompressed[fullKey] = decompressObject(value);
    } else {
      decompressed[fullKey] = decompressValue(value, fullKey);
    }
  }
  return decompressed;
}

export function compressConfigDiff(diff: Partial<ModalBuilderConfig>): Record<string, any> {
  return compressObject(diff);
}

export function decompressConfigDiff(compressed: Record<string, any>): Partial<ModalBuilderConfig> {
  return decompressObject(compressed) as Partial<ModalBuilderConfig>;
}

export function encodeCompressedConfig(compressed: Record<string, any>): string {
  return lzEnc(JSON.stringify(compressed));
}

export function decodeCompressedConfig(encoded: string): Record<string, any> | null {
  if (!encoded) return null;
  try {
    const decoded = lzDec(encoded);
    if (!decoded) return null;
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
