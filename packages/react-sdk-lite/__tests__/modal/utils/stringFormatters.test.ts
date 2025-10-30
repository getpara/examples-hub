import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { TNetwork } from '@getpara/web-sdk';
import * as common from '@getpara/react-common';
import { format } from 'date-fns';
import { formatNetworkList, formatWalletCreatedDate, camelToSnakeCase } from '../../../src/modal/utils/stringFormatters';

const getNetworkNameSpy = vi.spyOn(common, 'getNetworkName');

vi.mock('date-fns', () => ({
  format: vi.fn(),
}));

const mockFormat = format as MockedFunction<typeof format>;

describe('stringFormatters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatNetworkList', () => {
    it('should return single network name when only one network is provided', () => {
      const networks: TNetwork[] = ['ETHEREUM'];

      const result = formatNetworkList(networks);

      expect(result).toBe('Ethereum');
      expect(getNetworkNameSpy).toHaveBeenCalledTimes(1);
      expect(getNetworkNameSpy).toHaveBeenCalledWith('ETHEREUM');
    });

    it('should format two networks correctly', () => {
      const networks: TNetwork[] = ['ETHEREUM', 'POLYGON'];

      const result = formatNetworkList(networks);

      expect(result).toBe('Ethereum and Polygon');
      expect(getNetworkNameSpy).toHaveBeenCalledTimes(2);
      expect(getNetworkNameSpy).toHaveBeenNthCalledWith(1, 'ETHEREUM');
      expect(getNetworkNameSpy).toHaveBeenNthCalledWith(2, 'POLYGON');
    });

    it('should format three networks correctly with comma before "and"', () => {
      const networks: TNetwork[] = ['ETHEREUM', 'POLYGON', 'ARBITRUM'];

      const result = formatNetworkList(networks);

      expect(result).toBe('Ethereum, Polygon, and Arbitrum');
      expect(getNetworkNameSpy).toHaveBeenCalledTimes(3);
    });

    it('should format four networks correctly', () => {
      const networks: TNetwork[] = ['ETHEREUM', 'POLYGON', 'ARBITRUM', 'OPTIMISM'];

      const result = formatNetworkList(networks);

      expect(result).toBe('Ethereum, Polygon, Arbitrum, and Optimism');
      expect(getNetworkNameSpy).toHaveBeenCalledTimes(4);
    });

    it('should handle empty array', () => {
      const networks: TNetwork[] = [];

      const result = formatNetworkList(networks);

      expect(result).toBe('');
      expect(getNetworkNameSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('formatWalletCreatedDate', () => {
    it('should format date string correctly', () => {
      const dateString = '2023-12-25T10:30:00Z';
      mockFormat.mockReturnValue('12/25/23');

      const result = formatWalletCreatedDate(dateString);

      expect(result).toBe('12/25/23');
      expect(mockFormat).toHaveBeenCalledTimes(1);
      expect(mockFormat).toHaveBeenCalledWith(new Date(dateString), 'M/d/y');
    });

    it('should handle different date formats', () => {
      const dateString = '2024-01-01';
      mockFormat.mockReturnValue('1/1/24');

      const result = formatWalletCreatedDate(dateString);

      expect(result).toBe('1/1/24');
      expect(mockFormat).toHaveBeenCalledWith(new Date(dateString), 'M/d/y');
    });

    it('should handle ISO date string', () => {
      const dateString = '2024-06-15T14:22:33.123Z';
      mockFormat.mockReturnValue('6/15/24');

      const result = formatWalletCreatedDate(dateString);

      expect(result).toBe('6/15/24');
      expect(mockFormat).toHaveBeenCalledWith(new Date(dateString), 'M/d/y');
    });
  });

  describe('camelToSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      const result = camelToSnakeCase('camelCaseString');
      expect(result).toBe('camel_case_string');
    });

    it('should convert PascalCase to snake_case', () => {
      const result = camelToSnakeCase('PascalCaseString');
      expect(result).toBe('_pascal_case_string');
    });

    it('should handle single word', () => {
      const result = camelToSnakeCase('word');
      expect(result).toBe('word');
    });

    it('should handle empty string', () => {
      const result = camelToSnakeCase('');
      expect(result).toBe('');
    });

    it('should handle string with consecutive uppercase letters', () => {
      const result = camelToSnakeCase('XMLHttpRequest');
      expect(result).toBe('_x_m_l_http_request');
    });

    it('should handle string with numbers', () => {
      const result = camelToSnakeCase('myVar123Test');
      expect(result).toBe('my_var123_test');
    });

    it('should handle string starting with lowercase', () => {
      const result = camelToSnakeCase('myVariableName');
      expect(result).toBe('my_variable_name');
    });

    it('should handle already snake_case string', () => {
      const result = camelToSnakeCase('already_snake_case');
      expect(result).toBe('already_snake_case');
    });

    it('should handle single uppercase letter', () => {
      const result = camelToSnakeCase('A');
      expect(result).toBe('_a');
    });
  });
});
