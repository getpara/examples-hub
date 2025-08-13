import { describe, expect, it } from 'vitest';
import ParaCore, { Environment } from '../../src';

describe('ParaCore - resolveEnvironment', () => {
  describe('resolveEnvironment', () => {
    it('should throw error when apiKey is undefined', () => {
      expect(() => ParaCore.resolveEnvironment(Environment.DEV, undefined)).toThrow('A Para API key is required.');
    });

    it('should throw error when apiKey is null', () => {
      expect(() => ParaCore.resolveEnvironment(Environment.DEV, null as unknown as string)).toThrow(
        'A Para API key is required.',
      );
    });

    it('should throw error when apiKey is empty string', () => {
      expect(() => ParaCore.resolveEnvironment(Environment.DEV, '')).toThrow('A Para API key is required.');
    });

    describe('API key with environment prefix', () => {
      it('should return DEV environment from dev_ prefixed API key', () => {
        const result = ParaCore.resolveEnvironment(undefined, 'dev_api-key-123');
        expect(result).toBe(Environment.DEV);
      });

      it('should return SANDBOX environment from sandbox_ prefixed API key', () => {
        const result = ParaCore.resolveEnvironment(undefined, 'sandbox_api-key-123');
        expect(result).toBe(Environment.SANDBOX);
      });

      it('should return BETA environment from beta_ prefixed API key', () => {
        const result = ParaCore.resolveEnvironment(undefined, 'beta_api-key-123');
        expect(result).toBe(Environment.BETA);
      });

      it('should return PROD environment from prod_ prefixed API key', () => {
        const result = ParaCore.resolveEnvironment(undefined, 'prod_api-key-123');
        expect(result).toBe(Environment.PROD);
      });

      it('should be case insensitive for environment prefix', () => {
        const result = ParaCore.resolveEnvironment(undefined, 'Dev_api-key-123');
        expect(result).toBe(Environment.DEV);
      });

      it('should throw error for invalid environment prefix like development', () => {
        expect(() => ParaCore.resolveEnvironment(undefined, 'development_api-key-123')).toThrow(
          'Invalid API key environment prefix.',
        );
      });

      it('should throw error for invalid environment prefix like production', () => {
        expect(() => ParaCore.resolveEnvironment(undefined, 'production_api-key-123')).toThrow(
          'Invalid API key environment prefix.',
        );
      });

      it('should throw error for invalid environment prefix', () => {
        expect(() => ParaCore.resolveEnvironment(undefined, 'invalid_api-key-123')).toThrow(
          'Invalid API key environment prefix.',
        );
      });

      it('should throw error for empty environment prefix', () => {
        expect(() => ParaCore.resolveEnvironment(undefined, '_api-key-123')).toThrow('Invalid API key environment prefix.');
      });

      it('should handle API key with multiple underscores', () => {
        const result = ParaCore.resolveEnvironment(undefined, 'dev_api_key_with_underscores');
        expect(result).toBe(Environment.DEV);
      });

      it('should ignore passed env parameter when API key has valid prefix', () => {
        const result = ParaCore.resolveEnvironment(Environment.PROD, 'dev_api-key-123');
        expect(result).toBe(Environment.DEV);
      });
    });

    describe('API key without environment prefix', () => {
      it('should return provided environment when API key has no prefix', () => {
        const result = ParaCore.resolveEnvironment(Environment.DEV, 'api-key-without-prefix');
        expect(result).toBe(Environment.DEV);
      });

      it('should throw error when no environment provided and API key has no prefix', () => {
        expect(() => ParaCore.resolveEnvironment(undefined, 'api-key-without-prefix')).toThrow(
          'Environment parameter is required.',
        );
      });

      it('should throw error when null environment provided and API key has no prefix', () => {
        expect(() => ParaCore.resolveEnvironment(null as unknown as Environment, 'api-key-without-prefix')).toThrow(
          'Environment parameter is required.',
        );
      });

      it('should return all valid environments when provided', () => {
        expect(ParaCore.resolveEnvironment(Environment.DEV, 'api-key-123')).toBe(Environment.DEV);
        expect(ParaCore.resolveEnvironment(Environment.SANDBOX, 'api-key-123')).toBe(Environment.SANDBOX);
        expect(ParaCore.resolveEnvironment(Environment.BETA, 'api-key-123')).toBe(Environment.BETA);
        expect(ParaCore.resolveEnvironment(Environment.PROD, 'api-key-123')).toBe(Environment.PROD);
        expect(ParaCore.resolveEnvironment(Environment.DEVELOPMENT, 'api-key-123')).toBe(Environment.DEVELOPMENT);
        expect(ParaCore.resolveEnvironment(Environment.PRODUCTION, 'api-key-123')).toBe(Environment.PRODUCTION);
      });
    });

    describe('edge cases', () => {
      it('should throw error for API key that contains underscore but has invalid environment prefix', () => {
        expect(() => ParaCore.resolveEnvironment(Environment.DEV, 'api_key_no_env_prefix')).toThrow(
          'Invalid API key environment prefix.',
        );
      });

      it('should handle API key without underscores', () => {
        const result = ParaCore.resolveEnvironment(Environment.DEV, 'apikeynounderscores');
        expect(result).toBe(Environment.DEV);
      });

      it('should handle very short API key without prefix', () => {
        const result = ParaCore.resolveEnvironment(Environment.PROD, 'key');
        expect(result).toBe(Environment.PROD);
      });

      it('should handle single character API key without prefix', () => {
        const result = ParaCore.resolveEnvironment(Environment.BETA, 'k');
        expect(result).toBe(Environment.BETA);
      });
    });
  });
});
