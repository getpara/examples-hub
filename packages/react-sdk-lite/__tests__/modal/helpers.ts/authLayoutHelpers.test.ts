import { describe, expect, it } from 'vitest';
import { AuthLayout } from '../../../src';
import { hasEmbeddedAuth, hasExternalWallet } from '../../../src/modal/utils/authLayoutHelpers';

describe('authLayoutHelpers', () => {
  it('authLayoutHelpers', () => {
    expect(hasExternalWallet([AuthLayout.EXTERNAL_CONDENSED, AuthLayout.AUTH_CONDENSED])).toBeTruthy();
    expect(hasExternalWallet([AuthLayout.AUTH_CONDENSED])).toBeFalsy();
    expect(hasEmbeddedAuth([AuthLayout.EXTERNAL_CONDENSED, AuthLayout.AUTH_CONDENSED])).toBeTruthy();
    expect(hasEmbeddedAuth([AuthLayout.EXTERNAL_CONDENSED])).toBeFalsy();
  });
});
