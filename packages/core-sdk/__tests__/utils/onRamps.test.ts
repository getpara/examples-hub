import { describe, expect, it } from 'vitest';
import { getOnRampAssets, getOnRampNetworks, toAssetInfoArray } from '../../src/utils/index.js';
import { Network, OnRampAsset, WalletType } from '@getpara/user-management-client';

describe('definitions', () => {
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
