import { describe, it, expect } from 'vitest';
import ParaWeb, { ConstructorOpts, Environment } from '@getpara/web-sdk';
import { isConfigType, isParaWeb } from '../../src/provider/utils/paraConfigTypeGuards';

describe('Utility Functions', () => {
  describe('isConfigType', () => {
    it('should return true for a valid config object', () => {
      const validConfig = {
        env: 'production' as Environment,
        apiKey: 'test-api-key',
        opts: {} as ConstructorOpts,
      };
      expect(isConfigType(validConfig)).toBe(true);
    });

    it('should return false for an object missing env', () => {
      const invalidConfig = {
        apiKey: 'test-api-key',
        opts: {} as ConstructorOpts,
      };
      expect(isConfigType(invalidConfig)).toBe(false);
    });

    it('should return false for an object missing apiKey', () => {
      const invalidConfig = {
        env: 'production' as Environment,
        opts: {} as ConstructorOpts,
      };
      expect(isConfigType(invalidConfig)).toBe(false);
    });

    it('should return false for a non-object value', () => {
      expect(isConfigType(null)).toBe(false);
      expect(isConfigType(undefined)).toBe(false);
      expect(isConfigType(42)).toBe(false);
      expect(isConfigType('string')).toBe(false);
    });
  });

  describe('isParaWeb', () => {
    it('should return true for an instance of ParaWeb', () => {
      const paraWebInstance = new ParaWeb(Environment.DEV, 'test-api-key');
      expect(isParaWeb(paraWebInstance)).toBe(true);
    });

    it('should return false for a non-ParaWeb object', () => {
      const nonParaWebObject = { env: 'production', apiKey: 'test-api-key' };
      expect(isParaWeb(nonParaWebObject)).toBe(false);
    });

    it('should return false for a non-object value', () => {
      expect(isParaWeb(null)).toBe(false);
      expect(isParaWeb(undefined)).toBe(false);
      expect(isParaWeb(42)).toBe(false);
      expect(isParaWeb('string')).toBe(false);
    });
  });
});
