import { describe, expect, it } from 'vitest';
import {
  Environment,
  getCapsuleConnectBaseURL,
  getCapsuleConnectDomain,
  getOnRampAssets,
  getOnRampNetworks,
  getPortalBaseURL,
  getPortalDomain,
  toAssetInfoArray,
} from '../src/definitions';
import { Network, OnRampAsset, WalletType } from '@usecapsule/user-management-client';

describe('definitions', () => {
  describe('getPortalDomain', () => {
    it('DEV', () => {
      const resp = getPortalDomain(Environment.DEV);

      expect(resp).toBe('localhost');
    });
    it('SANDBOX', () => {
      const resp = getPortalDomain(Environment.SANDBOX);

      expect(resp).toBe('app.sandbox.usecapsule.com');
    });
    it('BETA', () => {
      const resp = getPortalDomain(Environment.BETA);

      expect(resp).toBe('app.beta.usecapsule.com');
    });
    it('PROD', () => {
      const resp = getPortalDomain(Environment.PROD);

      expect(resp).toBe('app.usecapsule.com');
    });
    it('E2E', () => {
      const resp = getPortalDomain(Environment.DEV, true);

      expect(resp).toBe('localhost');
    });
    it('fail', () => {
      expect(() => getPortalDomain('fail' as Environment)).toThrowError('env: fail not supported');
    });
  });
  describe('getPortalBaseURL', () => {
    it('DEV', () => {
      const resp = getPortalBaseURL({ env: Environment.DEV });

      expect(resp).toBe('http://localhost:3003');
    });
    it('DEV - local IP', () => {
      const resp = getPortalBaseURL({ env: Environment.DEV }, true);

      expect(resp).toBe('http://127.0.0.1:3003');
    });
    it('SANDBOX', () => {
      const resp = getPortalBaseURL({ env: Environment.SANDBOX });

      expect(resp).toBe('https://app.sandbox.usecapsule.com');
    });
    it('BETA', () => {
      const resp = getPortalBaseURL({ env: Environment.BETA });

      expect(resp).toBe('https://app.beta.usecapsule.com');
    });
    it('PROD', () => {
      const resp = getPortalBaseURL({ env: Environment.PROD });

      expect(resp).toBe('https://app.usecapsule.com');
    });
    it('E2E', () => {
      const resp = getPortalBaseURL({ env: Environment.DEV, isE2E: true });

      expect(resp).toBe('http://localhost:3003');
    });
    it('E2E - WASM', () => {
      const resp = getPortalBaseURL({ env: Environment.DEV, isE2E: true }, false, true);

      expect(resp).toBe('https://app.sandbox.usecapsule.com');
    });
  });
  describe('getCapsuleConnectDomain', () => {
    it('DEV', () => {
      const resp = getCapsuleConnectDomain(Environment.DEV);

      expect(resp).toBe('localhost');
    });
    it('SANDBOX', () => {
      const resp = getCapsuleConnectDomain(Environment.SANDBOX);

      expect(resp).toBe('connect.sandbox.usecapsule.com');
    });
    it('BETA', () => {
      const resp = getCapsuleConnectDomain(Environment.BETA);

      expect(resp).toBe('connect.beta.usecapsule.com');
    });
    it('PROD', () => {
      const resp = getCapsuleConnectDomain(Environment.PROD);

      expect(resp).toBe('connect.usecapsule.com');
    });
    it('fail', () => {
      expect(() => getCapsuleConnectDomain('fail' as Environment)).toThrowError('env: fail not supported');
    });
  });
  describe('getCapsuleConnectBaseURL', () => {
    it('DEV', () => {
      const resp = getCapsuleConnectBaseURL({ env: Environment.DEV });

      expect(resp).toBe('http://localhost:3008');
    });
    it('DEV - local IP', () => {
      const resp = getCapsuleConnectBaseURL({ env: Environment.DEV }, true);

      expect(resp).toBe('http://127.0.0.1:3008');
    });
    it('SANDBOX', () => {
      const resp = getCapsuleConnectBaseURL({ env: Environment.SANDBOX });

      expect(resp).toBe('https://connect.sandbox.usecapsule.com');
    });
    it('BETA', () => {
      const resp = getCapsuleConnectBaseURL({ env: Environment.BETA });

      expect(resp).toBe('https://connect.beta.usecapsule.com');
    });
    it('PROD', () => {
      const resp = getCapsuleConnectBaseURL({ env: Environment.PROD });

      expect(resp).toBe('https://connect.usecapsule.com');
    });
  });
  describe('toAssetInfoArray', () => {
    it('success', () => {
      const resp = toAssetInfoArray({
        EVM: { ETHEREUM: { ETHEREUM: { STRIPE: ['test', { BUY: true }] } } },
        SOLANA: {},
        COSMOS: {},
      });

      expect(resp).toStrictEqual([
        [WalletType.EVM, Network.ETHEREUM, Network.ETHEREUM, { STRIPE: ['test', { BUY: true }] }],
      ]);
    });
  });
  describe('getOnRampNetworks', () => {
    it('success', () => {
      const resp = getOnRampNetworks(
        {
          EVM: { ETHEREUM: { ETHEREUM: { STRIPE: ['test', { BUY: true }] } } },
          SOLANA: {},
          COSMOS: {},
        },
        { walletType: WalletType.EVM, allowed: [Network.ETHEREUM] },
      );

      expect(resp).toStrictEqual([Network.ETHEREUM]);
    });
    it('success - no networks', () => {
      const resp = getOnRampNetworks(
        {
          EVM: { ETHEREUM: { ETHEREUM: { STRIPE: ['test', { BUY: true }] } } },
          SOLANA: {},
          COSMOS: {},
        },
        { walletType: WalletType.EVM, allowed: [Network.SEPOLIA] },
      );

      expect(resp).toStrictEqual([]);
    });
    it('success - no wallet types', () => {
      const resp = getOnRampNetworks(
        {
          EVM: { ETHEREUM: { ETHEREUM: { STRIPE: ['test', { BUY: true }] } } },
          SOLANA: {},
          COSMOS: {},
        },
        { walletType: WalletType.SOLANA, allowed: [Network.SOLANA] },
      );

      expect(resp).toStrictEqual([]);
    });
  });
  describe('getOnRampAssets', () => {
    it('success', () => {
      const resp = getOnRampAssets({
        EVM: { ETHEREUM: { ETHEREUM: { STRIPE: ['test', { BUY: true }] } } },
        SOLANA: {},
        COSMOS: {},
      });

      expect(resp).toStrictEqual([Network.ETHEREUM]);
    });
    it('success - no networks', () => {
      const resp = getOnRampAssets(
        {
          EVM: { ETHEREUM: { ETHEREUM: { STRIPE: ['test', { BUY: true }] } } },
          SOLANA: {},
          COSMOS: {},
        },
        { network: Network.SOLANA },
      );

      expect(resp).toStrictEqual([]);
    });
    it('success - no wallet types', () => {
      const resp = getOnRampAssets(
        {
          EVM: { ETHEREUM: { ETHEREUM: { STRIPE: ['test', { BUY: true }] } } },
          SOLANA: {},
          COSMOS: {},
        },
        { walletType: WalletType.SOLANA },
      );

      expect(resp).toStrictEqual([]);
    });
    it('success - not allowed', () => {
      const resp = getOnRampAssets(
        {
          EVM: { ETHEREUM: { ETHEREUM: { STRIPE: ['test', { BUY: true }] } } },
          SOLANA: {},
          COSMOS: {},
        },
        { allowed: [OnRampAsset.SOLANA] },
      );

      expect(resp).toStrictEqual([]);
    });
  });
});
