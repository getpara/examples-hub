import * as ipaddr from 'ipaddr.js';

const MAX_PREFIX = {
  ipv4: 32,
  ipv6: 128,
} as const;

export const isValidIpAddress = (value: string): boolean => {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  try {
    ipaddr.parse(trimmed);
    return true;
  } catch {
    return false;
  }
};

export const isValidCidrBlock = (value: string): boolean => {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  try {
    const [address, prefixLength] = ipaddr.parseCIDR(trimmed);
    const maxPrefix = address.kind() === 'ipv4' ? MAX_PREFIX.ipv4 : MAX_PREFIX.ipv6;

    return prefixLength >= 0 && prefixLength <= maxPrefix;
  } catch {
    return false;
  }
};

export const normalizeCidrEntries = (value: string | null | undefined): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean);
};
