import { describe, it, expect } from 'vitest';
import { validateBalancesConfig } from '../../src/utils/config';
import { BalancesConfig, TNetwork } from '@getpara/user-management-client';

describe('config utilities', () => {
  describe('validateBalancesConfig', () => {
    it('should validate a valid AGGREGATED config with no additional properties', () => {
      const config: BalancesConfig = {
        displayType: 'AGGREGATED',
      };

      expect(validateBalancesConfig(config)).toBe(true);
    });

    it('should validate a valid AGGREGATED config with excludeStandardAssets', () => {
      const config: BalancesConfig = {
        displayType: 'AGGREGATED',
        excludeStandardAssets: true,
      };

      expect(validateBalancesConfig(config)).toBe(true);
    });

    it('should validate a valid AGGREGATED config with additionalAssets', () => {
      const config: BalancesConfig = {
        displayType: 'AGGREGATED',
        additionalAssets: [
          {
            name: 'Test Token',
            symbol: 'TEST',
            priceUrl: 'https://api.example.com/price',
            implementations: [
              {
                contractAddress: '0x1234567890123456789012345678901234567890',
                network: 'ETHEREUM',
              },
            ],
          },
        ],
      };

      expect(validateBalancesConfig(config)).toBe(true);
    });

    it('should validate a valid CUSTOM_ASSET config', () => {
      const config: BalancesConfig = {
        displayType: 'CUSTOM_ASSET',
        asset: {
          name: 'Custom Token',
          symbol: 'CUSTOM',
          implementations: [
            {
              contractAddress: '0x1234567890123456789012345678901234567890',
              network: 'ETHEREUM',
            },
          ],
        },
      };

      expect(validateBalancesConfig(config)).toBe(true);
    });

    it('should reject null or undefined', () => {
      expect(validateBalancesConfig(null)).toBe(false);
      expect(validateBalancesConfig(undefined)).toBe(false);
    });

    it('should reject non-objects', () => {
      expect(validateBalancesConfig('string')).toBe(false);
      expect(validateBalancesConfig(123)).toBe(false);
      expect(validateBalancesConfig([])).toBe(false);
    });

    it('should reject missing displayType', () => {
      const config = {};
      expect(validateBalancesConfig(config)).toBe(false);
    });

    it('should reject invalid displayType', () => {
      const config = {
        displayType: 'INVALID_TYPE',
      };
      expect(validateBalancesConfig(config)).toBe(false);
    });

    it('should reject AGGREGATED config with invalid excludeStandardAssets type', () => {
      const config = {
        displayType: 'AGGREGATED',
        excludeStandardAssets: 'not-a-boolean',
      };
      expect(validateBalancesConfig(config)).toBe(false);
    });

    it('should reject AGGREGATED config with invalid additionalAssets type', () => {
      const config = {
        displayType: 'AGGREGATED',
        additionalAssets: 'not-an-array',
      };
      expect(validateBalancesConfig(config)).toBe(false);
    });

    it('should reject AGGREGATED config with invalid additionalAssets items', () => {
      const config = {
        displayType: 'AGGREGATED',
        additionalAssets: [
          {
            name: 'Test Token',
            symbol: 'TEST',
            // Missing required fields
          },
        ],
      };
      expect(validateBalancesConfig(config)).toBe(false);
    });

    it('should reject CUSTOM_ASSET config without asset', () => {
      const config = {
        displayType: 'CUSTOM_ASSET',
      };
      expect(validateBalancesConfig(config)).toBe(false);
    });

    it('should reject CUSTOM_ASSET config with invalid asset', () => {
      const config = {
        displayType: 'CUSTOM_ASSET',
        asset: {
          name: 'Test Token',
          // Missing required fields
        },
      };
      expect(validateBalancesConfig(config)).toBe(false);
    });
  });

  describe('CustomAsset validation (via validateBalancesConfig)', () => {
    it('should validate custom asset with priceUrl', () => {
      const config: BalancesConfig = {
        displayType: 'CUSTOM_ASSET',
        asset: {
          name: 'Test Token',
          symbol: 'TEST',
          priceUrl: 'https://api.example.com/price',
          implementations: [
            {
              contractAddress: '0x1234567890123456789012345678901234567890',
              network: 'ETHEREUM',
            },
          ],
        },
      };

      expect(validateBalancesConfig(config)).toBe(true);
    });

    it('should validate custom asset with price object', () => {
      const config: BalancesConfig = {
        displayType: 'CUSTOM_ASSET',
        asset: {
          name: 'Test Token',
          symbol: 'TEST',
          price: {
            value: 1.5,
            currency: 'USD',
          },
          implementations: [
            {
              contractAddress: '0x1234567890123456789012345678901234567890',
              network: 'ETHEREUM',
            },
          ],
        },
      };

      expect(validateBalancesConfig(config)).toBe(true);
    });

    it('should validate custom asset with custom network', () => {
      const config: BalancesConfig = {
        displayType: 'CUSTOM_ASSET',
        asset: {
          name: 'Test Token',
          symbol: 'TEST',
          priceUrl: 'https://api.example.com/price',
          implementations: [
            {
              contractAddress: '0x1234567890123456789012345678901234567890',
              network: {
                name: 'Custom Network',
                rpcUrl: 'https://rpc.example.com',
                evmChainId: '12345',
              },
            },
          ],
        },
      };

      expect(validateBalancesConfig(config)).toBe(true);
    });

    it('should validate custom asset with multiple networks', () => {
      const config: BalancesConfig = {
        displayType: 'CUSTOM_ASSET',
        asset: {
          name: 'Test Token',
          symbol: 'TEST',
          priceUrl: 'https://api.example.com/price',
          implementations: [
            {
              contractAddress: '0x1234567890123456789012345678901234567890',
              network: 'ETHEREUM',
            },
            {
              contractAddress: '0x0987654321098765432109876543210987654321',
              network: 'POLYGON',
            },
          ],
        },
      };

      expect(validateBalancesConfig(config)).toBe(true);
    });

    it('should reject custom asset with empty name', () => {
      const config: BalancesConfig = {
        displayType: 'CUSTOM_ASSET',
        asset: {
          name: '',
          symbol: 'TEST',
          priceUrl: 'https://api.example.com/price',
          implementations: [
            {
              contractAddress: '0x1234567890123456789012345678901234567890',
              network: 'ETHEREUM',
            },
          ],
        },
      };

      expect(validateBalancesConfig(config)).toBe(false);
    });

    it('should reject custom asset with empty symbol', () => {
      const config: BalancesConfig = {
        displayType: 'CUSTOM_ASSET',
        asset: {
          name: 'Test Token',
          symbol: '',
          priceUrl: 'https://api.example.com/price',
          implementations: [
            {
              contractAddress: '0x1234567890123456789012345678901234567890',
              network: 'ETHEREUM',
            },
          ],
        },
      };

      expect(validateBalancesConfig(config)).toBe(false);
    });

    it('should reject custom asset with no networks', () => {
      const config: BalancesConfig = {
        displayType: 'CUSTOM_ASSET',
        asset: {
          name: 'Test Token',
          symbol: 'TEST',
          priceUrl: 'https://api.example.com/price',
          implementations: [],
        },
      };

      expect(validateBalancesConfig(config)).toBe(false);
    });

    it('should reject custom asset with empty contractAddress', () => {
      const config: BalancesConfig = {
        displayType: 'CUSTOM_ASSET',
        asset: {
          name: 'Test Token',
          symbol: 'TEST',
          priceUrl: 'https://api.example.com/price',
          implementations: [
            {
              contractAddress: '',
              network: 'ETHEREUM',
            },
          ],
        },
      };

      expect(validateBalancesConfig(config)).toBe(false);
    });

    it('should accept custom asset with undefined contractAddress for custom network native tokens', () => {
      const config: BalancesConfig = {
        displayType: 'CUSTOM_ASSET',
        asset: {
          name: 'Custom Token',
          symbol: 'CUSTOM',
          priceUrl: 'https://api.example.com/price',
          implementations: [
            {
              contractAddress: undefined, // Native token - no contract address
              network: {
                name: 'Custom Network',
                rpcUrl: 'https://rpc.custom.network',
                evmChainId: '12345',
              },
            },
          ],
        },
      };

      expect(validateBalancesConfig(config)).toBe(true);
    });

    it('should accept aggregated config with undefined contractAddress for custom network native additional assets', () => {
      const config: BalancesConfig = {
        displayType: 'AGGREGATED',
        additionalAssets: [
          {
            name: 'Custom Token',
            symbol: 'CUSTOM',
            priceUrl: 'https://api.example.com/price',
            implementations: [
              {
                contractAddress: undefined, // Native token - no contract address
                network: {
                  name: 'Custom Network',
                  rpcUrl: 'https://rpc.custom.network',
                  evmChainId: '12345',
                },
              },
            ],
          },
        ],
      };

      expect(validateBalancesConfig(config)).toBe(true);
    });

    it('should reject custom asset with undefined contractAddress for predefined networks', () => {
      const config: BalancesConfig = {
        displayType: 'CUSTOM_ASSET',
        asset: {
          name: 'Test Token',
          symbol: 'TEST',
          priceUrl: 'https://api.example.com/price',
          implementations: [
            {
              contractAddress: undefined, // Not allowed for predefined networks
              network: 'ETHEREUM', // Predefined network string
            },
          ],
        },
      };

      expect(validateBalancesConfig(config)).toBe(false);
    });

    it('should reject custom asset with invalid network', () => {
      const config: BalancesConfig = {
        displayType: 'CUSTOM_ASSET',
        asset: {
          name: 'Test Token',
          symbol: 'TEST',
          priceUrl: 'https://api.example.com/price',
          implementations: [
            {
              contractAddress: '0x1234567890123456789012345678901234567890',
              network: 'INVALID_NETWORK' as TNetwork,
            },
          ],
        },
      };

      expect(validateBalancesConfig(config)).toBe(false);
    });

    it('should reject custom asset with invalid custom network', () => {
      const config: BalancesConfig = {
        displayType: 'CUSTOM_ASSET',
        asset: {
          name: 'Test Token',
          symbol: 'TEST',
          priceUrl: 'https://api.example.com/price',
          implementations: [
            {
              contractAddress: '0x1234567890123456789012345678901234567890',
              network: {
                name: '',
                rpcUrl: 'https://rpc.example.com',
                evmChainId: '12345',
              },
            },
          ],
        },
      };

      expect(validateBalancesConfig(config)).toBe(false);
    });

    it('should reject custom asset with both priceUrl and price', () => {
      const config: BalancesConfig = {
        displayType: 'CUSTOM_ASSET',
        asset: {
          name: 'Test Token',
          symbol: 'TEST',
          priceUrl: 'https://api.example.com/price',
          price: {
            value: 1.5,
            currency: 'USD',
          },
          implementations: [
            {
              contractAddress: '0x1234567890123456789012345678901234567890',
              network: 'ETHEREUM',
            },
          ],
        },
      };

      expect(validateBalancesConfig(config)).toBe(false);
    });
  });
});
