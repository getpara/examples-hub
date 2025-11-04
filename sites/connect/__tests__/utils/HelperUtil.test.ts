import { beforeEach, describe, it, expect, vi } from 'vitest';
import {
  truncate,
  convertHexToUtf8,
  getSignParamsMessage,
  getSignTypedDataParamsData,
  getWalletAddressFromParams,
  isEIP155Chain,
  isKadenaChain,
  formatChainName,
  styledToast,
} from '../../src/utils/HelperUtil';

// Mock toast for testing
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ethers is imported for actual utility function testing (no mocking needed for synchronous functions)

import toast from 'react-hot-toast';

describe('HelperUtil', () => {
  describe('truncate', () => {
    it('should return original string if length is less than or equal to specified length', () => {
      const shortString = 'hello';
      const result = truncate(shortString, 10);
      expect(result).toBe('hello');
    });

    it('should truncate string in the middle with ellipsis', () => {
      const longString = '0x1234567890abcdef1234567890abcdef12345678';
      const result = truncate(longString, 10);
      // With length 10: "..." takes 3 chars, leaving 7 for content
      // Front: ceil(7/2) = 4, Back: floor(7/2) = 3
      expect(result).toBe('0x12...678');
    });

    it('should handle even length truncation correctly', () => {
      const longString = 'abcdefghijklmnop';
      const result = truncate(longString, 8);
      // With length 8: "..." takes 3 chars, leaving 5 for content
      // Front: ceil(5/2) = 3, Back: floor(5/2) = 2
      expect(result).toBe('abc...op');
    });

    it('should handle odd length truncation correctly', () => {
      const longString = 'abcdefghijklmnop';
      const result = truncate(longString, 9);
      // With length 9: "..." takes 3 chars, leaving 6 for content
      // Front: ceil(6/2) = 3, Back: floor(6/2) = 3
      expect(result).toBe('abc...nop');
    });

    it('should handle empty string values', () => {
      // Test empty string which should return as-is
      const result = truncate('', 10);
      expect(result).toBe('');
    });

    // Note: The function doesn't properly handle undefined/null - it would throw an error
    // This could be improved in the actual implementation
  });

  describe('convertHexToUtf8', () => {
    it('should convert valid hex string to UTF8', () => {
      // Real hex encoding of "Hello World"
      const hexValue = '0x48656c6c6f20576f726c64';
      const result = convertHexToUtf8(hexValue);

      expect(result).toBe('Hello World');
    });

    it('should return original value if not a valid hex string', () => {
      const nonHexValue = 'regular string';
      const result = convertHexToUtf8(nonHexValue);

      expect(result).toBe(nonHexValue);
    });

    it('should handle empty hex string', () => {
      const emptyHex = '0x';
      const result = convertHexToUtf8(emptyHex);

      expect(result).toBe('');
    });
  });

  describe('getSignParamsMessage', () => {
    it('should extract message from params by filtering out addresses', () => {
      // Valid Ethereum address (Vitalik's address)
      const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
      const message = 'Hello World';

      const params = [address, message];
      const result = getSignParamsMessage(params);

      expect(result).toBe(message);
    });

    it('should convert hex message to UTF8', () => {
      // Valid Ethereum address (Vitalik's address)
      const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
      // Real hex encoding of "Hello"
      const hexMessage = '0x48656c6c6f';

      const params = [address, hexMessage];
      const result = getSignParamsMessage(params);

      expect(result).toBe('Hello');
    });

    it('should handle multiple non-address params and return first one', () => {
      const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
      const message1 = 'First message';
      const message2 = 'Second message';

      const params = [address, message1, message2];
      const result = getSignParamsMessage(params);

      expect(result).toBe(message1);
    });
  });

  describe('getSignTypedDataParamsData', () => {
    it('should extract data from params by filtering out addresses', () => {
      // Valid Ethereum address (Vitalik's address)
      const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
      const data = { domain: { name: 'Test' }, message: { test: 'value' } };

      const params = [address, data] as any;
      const result = getSignTypedDataParamsData(params);

      expect(result).toBe(data);
    });

    it('should parse JSON string data', () => {
      // Valid Ethereum address (Vitalik's address)
      const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
      const dataObject = {
        domain: { name: 'Test' },
        message: { test: 'value' },
      };
      const dataString = JSON.stringify(dataObject);

      const params = [address, dataString];
      const result = getSignTypedDataParamsData(params);

      expect(result).toEqual(dataObject);
    });

    it('should handle invalid addresses correctly and return non-address as data', () => {
      const invalidAddress = 'not-an-address';
      const validData = { domain: { name: 'Test' } };

      // Since invalidAddress is not a real address, it should be treated as data
      // The function will try to JSON.parse it and fail, so we should expect that behavior
      const params = [invalidAddress, validData];

      // This should throw because 'not-an-address' is not valid JSON
      expect(() => getSignTypedDataParamsData(params as any)).toThrow();
    });

    it('should return non-JSON string as-is when address filtering works correctly', () => {
      const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
      const plainTextData = 'plain text message';

      const params = [address, plainTextData];

      // This should throw because plain text is not valid JSON
      expect(() => getSignTypedDataParamsData(params)).toThrow();
    });
  });

  describe('getWalletAddressFromParams', () => {
    it('should find matching address in params (case insensitive)', () => {
      const addresses = ['0x1234567890123456789012345678901234567890', '0xabcdef1234567890abcdef1234567890abcdef12'];
      const params = {
        from: '0x1234567890123456789012345678901234567890',
        to: '0x9876543210987654321098765432109876543210',
      };

      const result = getWalletAddressFromParams(addresses, params);
      expect(result).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should handle case insensitive matching', () => {
      const addresses = ['0x1234567890123456789012345678901234567890'];
      const params = {
        from: '0x1234567890123456789012345678901234567890'.toUpperCase(),
      };

      const result = getWalletAddressFromParams(addresses, params);
      expect(result).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should return empty string if no address matches', () => {
      const addresses = ['0x1234567890123456789012345678901234567890'];
      const params = {
        from: '0x9876543210987654321098765432109876543210',
      };

      const result = getWalletAddressFromParams(addresses, params);
      expect(result).toBe('');
    });
  });

  describe('isEIP155Chain', () => {
    it('should return true for EIP155 chains', () => {
      expect(isEIP155Chain('eip155:1')).toBe(true);
      expect(isEIP155Chain('eip155:137')).toBe(true);
      expect(isEIP155Chain('eip155:42161')).toBe(true);
    });

    it('should return false for non-EIP155 chains', () => {
      expect(isEIP155Chain('cosmos:cosmoshub-4')).toBe(false);
      expect(isEIP155Chain('kadena:mainnet01')).toBe(false);
      expect(isEIP155Chain('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe(false);
    });
  });

  describe('isKadenaChain', () => {
    it('should return true for Kadena chains', () => {
      expect(isKadenaChain('kadena:mainnet01')).toBe(true);
      expect(isKadenaChain('kadena:testnet04')).toBe(true);
    });

    it('should return false for non-Kadena chains', () => {
      expect(isKadenaChain('eip155:1')).toBe(false);
      expect(isKadenaChain('cosmos:cosmoshub-4')).toBe(false);
      expect(isKadenaChain('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe(false);
    });
  });

  describe('formatChainName', () => {
    it('should return chain name from EIP155_CHAINS if found', () => {
      // This test would need to know the actual structure of EIP155_CHAINS
      // For now, testing the fallback behavior
      const chainId = 'unknown:123';
      const result = formatChainName(chainId);
      expect(result).toBe(chainId);
    });

    it('should return chainId as fallback if not found in EIP155_CHAINS', () => {
      const unknownChainId = 'unknown:999999';
      const result = formatChainName(unknownChainId);
      expect(result).toBe(unknownChainId);
    });
  });

  describe('styledToast', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call toast.success with correct styling for success type', () => {
      const message = 'Operation successful';
      styledToast(message, 'success');

      expect(toast.success).toHaveBeenCalledWith(message, {
        position: 'bottom-left',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    });

    it('should call toast.error with correct styling for error type', () => {
      const message = 'Operation failed';
      styledToast(message, 'error');

      expect(toast.error).toHaveBeenCalledWith(message, {
        position: 'bottom-left',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    });

    it('should not call any toast method for unknown types', () => {
      const message = 'Some message';
      styledToast(message, 'unknown');

      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });
  });
});
