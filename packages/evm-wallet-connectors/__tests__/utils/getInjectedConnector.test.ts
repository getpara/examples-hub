import { describe, expect, it } from 'vitest';
import { hasInjectedProvider, getInjectedProvider, getInjectedConnector } from '../../src/utils/getInjectedConnector';
import { WalletProviderFlags } from '../../src/types/utils';

describe('getInjectedConnector', () => {
  it('returns a connector function', () => {
    const connector = getInjectedConnector({});
    expect(typeof connector).toBe('function');
  });

  it('hasInjectedProvider returns false if no provider', () => {
    expect(hasInjectedProvider({ flag: 'isMetaMask' })).toBe(false);
  });

  it('getInjectedProvider returns undefined if no provider', () => {
    expect(getInjectedProvider({ flag: 'isMetaMask' })).toBeUndefined();
  });

  it('hasInjectedProvider returns false for unknown flag', () => {
    expect(hasInjectedProvider({ flag: 'notAFlag' as WalletProviderFlags })).toBe(false);
  });

  it('getInjectedProvider returns undefined for unknown flag', () => {
    expect(getInjectedProvider({ flag: 'notAFlag' as WalletProviderFlags })).toBeUndefined();
  });

  it('getInjectedConnector returns function even with unknown flag', () => {
    const connector = getInjectedConnector({ flag: 'notAFlag' as WalletProviderFlags });
    expect(typeof connector).toBe('function');
  });
});
