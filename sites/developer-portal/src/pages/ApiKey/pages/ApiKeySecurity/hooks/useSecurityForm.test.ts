import { describe, it, expect } from 'vitest';
import { isValidIpAddress, isValidCidrBlock, normalizeCidrEntries } from '../../../../../utils/ipAllowlist';

describe('IP Address Validation', () => {
  describe('IPv4 validation', () => {
    it('should accept valid IPv4 addresses', () => {
      expect(isValidIpAddress('192.168.1.1')).toBe(true);
      expect(isValidIpAddress('10.0.0.1')).toBe(true);
      expect(isValidIpAddress('172.16.0.1')).toBe(true);
      expect(isValidIpAddress('255.255.255.255')).toBe(true);
      expect(isValidIpAddress('0.0.0.0')).toBe(true);
      expect(isValidIpAddress('127.0.0.1')).toBe(true);
    });

    it('should reject invalid IPv4 addresses', () => {
      expect(isValidIpAddress('256.1.1.1')).toBe(false);
      expect(isValidIpAddress('1.1.1.256')).toBe(false);
      expect(isValidIpAddress('192.168.1')).toBe(false);
      expect(isValidIpAddress('192.168.1.1.1')).toBe(false);
      expect(isValidIpAddress('192.168.-1.1')).toBe(false);
      expect(isValidIpAddress('192.168.a.1')).toBe(false);
    });
  });

  describe('IPv6 validation', () => {
    it('should accept valid IPv6 addresses', () => {
      expect(isValidIpAddress('2001:db8::1')).toBe(true);
      expect(isValidIpAddress('::1')).toBe(true);
      expect(isValidIpAddress('::')).toBe(true);
      expect(isValidIpAddress('fe80::1')).toBe(true);
      expect(isValidIpAddress('2001:db8:85a3::8a2e:370:7334')).toBe(true);
      expect(isValidIpAddress('2001:0db8:0000:0000:0000:0000:0000:0001')).toBe(true);
      expect(isValidIpAddress('::ffff:192.0.2.0')).toBe(true);
      expect(isValidIpAddress('2001:db8::ffff:203.0.113.5')).toBe(true);
    });

    it('should reject invalid IPv6 addresses', () => {
      expect(isValidIpAddress('invalid::ipv6::address')).toBe(false);
      expect(isValidIpAddress('gggg::1')).toBe(false);
      expect(isValidIpAddress('2001:db8:::1')).toBe(false);
      expect(isValidIpAddress('not-an-ip')).toBe(false);
      expect(isValidIpAddress('')).toBe(false);
      expect(isValidIpAddress('::ffff:999.0.2.1')).toBe(false);
      expect(isValidIpAddress('::ffff:192.0.2.1:123')).toBe(false);
      expect(isValidIpAddress('2001:db8:192.0.2.1')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings and whitespace', () => {
      expect(isValidIpAddress('')).toBe(false);
      expect(isValidIpAddress(' ')).toBe(false);
      expect(isValidIpAddress('  192.168.1.1  ')).toBe(true); // Trimming allows whitespace
    });

    it('should handle malformed inputs', () => {
      expect(isValidIpAddress('localhost')).toBe(false);
      expect(isValidIpAddress('http://192.168.1.1')).toBe(false);
      expect(isValidIpAddress('192.168.1.1:8080')).toBe(false);
    });
  });
});

describe('CIDR validation', () => {
  it('accepts valid IPv4 CIDRs', () => {
    expect(isValidCidrBlock('192.168.1.0/24')).toBe(true);
    expect(isValidCidrBlock('10.0.0.1/32')).toBe(true);
  });

  it('accepts valid IPv6 CIDRs', () => {
    expect(isValidCidrBlock('2001:db8::/64')).toBe(true);
    expect(isValidCidrBlock('::1/128')).toBe(true);
  });

  it('accepts IPv4-mapped IPv6 CIDRs', () => {
    expect(isValidCidrBlock('::ffff:192.0.2.0/120')).toBe(true);
  });

  it('rejects malformed CIDRs', () => {
    expect(isValidCidrBlock('not-a-cidr')).toBe(false);
    expect(isValidCidrBlock('192.168.1.0')).toBe(false);
    expect(isValidCidrBlock('::ffff:192.0.2.0/129')).toBe(false);
    expect(isValidCidrBlock('999.0.0.0/12')).toBe(false);
  });
});

describe('normalizeCidrEntries', () => {
  it('splits and trims comma-separated values', () => {
    expect(normalizeCidrEntries(' 10.0.0.1/32 ,  10.0.0.2/32 ')).toEqual(['10.0.0.1/32', '10.0.0.2/32']);
  });

  it('filters empty values', () => {
    expect(normalizeCidrEntries(' , 192.168.1.0/24,, ')).toEqual(['192.168.1.0/24']);
  });

  it('returns empty array for nullish input', () => {
    expect(normalizeCidrEntries('')).toEqual([]);
    expect(normalizeCidrEntries(null)).toEqual([]);
    expect(normalizeCidrEntries(undefined)).toEqual([]);
  });
});
