import { describe, it, expect } from 'vitest';

// Extract the IP validation logic for testing
// Basic validation - backend does strict validation
const isValidIpAddress = (ip: string): boolean => {
  // IPv4: Check for 4 groups of 1-3 digits separated by dots
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipv4Match = ip.match(ipv4Regex);

  if (ipv4Match) {
    // Validate each octet is 0-255
    return ipv4Match.slice(1).every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  // IPv6: Basic validation for common patterns
  // Must contain only hex digits, colons, and at most one ::
  // Reject if it has triple colons or invalid characters
  if (ip.includes(':::')) return false;
  if (!/^[0-9a-fA-F:]+$/.test(ip)) return false;

  // Check for valid :: compression (max one occurrence)
  const doubleColonCount = (ip.match(/::/g) || []).length;
  if (doubleColonCount > 1) return false;

  // Very simplified IPv6 check - just ensure it has valid hex and colon structure
  // The backend will do the complete validation
  const parts = ip.split(':');
  const hasValidParts = parts.every(part => part === '' || /^[0-9a-fA-F]{1,4}$/i.test(part));
  const hasReasonableLength = parts.length >= 3 && parts.length <= 8;

  return hasValidParts && hasReasonableLength;
};

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
    });

    it('should reject invalid IPv6 addresses', () => {
      expect(isValidIpAddress('invalid::ipv6::address')).toBe(false);
      expect(isValidIpAddress('gggg::1')).toBe(false);
      expect(isValidIpAddress('2001:db8:::1')).toBe(false);
      expect(isValidIpAddress('not-an-ip')).toBe(false);
      expect(isValidIpAddress('')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings and whitespace', () => {
      expect(isValidIpAddress('')).toBe(false);
      expect(isValidIpAddress(' ')).toBe(false);
      expect(isValidIpAddress('  192.168.1.1  ')).toBe(false); // Has whitespace
    });

    it('should handle malformed inputs', () => {
      expect(isValidIpAddress('localhost')).toBe(false);
      expect(isValidIpAddress('http://192.168.1.1')).toBe(false);
      expect(isValidIpAddress('192.168.1.1:8080')).toBe(false);
    });
  });
});
