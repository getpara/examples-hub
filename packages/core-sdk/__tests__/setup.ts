import { vi } from 'vitest';
import forge from 'node-forge';
import crypto from 'crypto';

// Generate a valid RSA key pair once for all tests
// Using a fixed seed for consistency
const TEST_KEY_PAIR = forge.pki.rsa.generateKeyPair({
  bits: 2048,
  e: 0x10001,
  prng: forge.random.createInstance(),
  workers: -1, // Synchronous generation
});

// Mock getAsymmetricKeyPair to return the pre-generated key pair
// But use the real implementation when a seed is provided (for utils.test.ts)
vi.mock('../src/cryptography/utils', async importOriginal => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    getAsymmetricKeyPair: vi.fn((ctx, seedValue) => {
      // If a seed is provided, use the real implementation
      if (seedValue) {
        return actual.getAsymmetricKeyPair(ctx, seedValue);
      }
      // Otherwise return the pre-generated key pair
      return Promise.resolve(TEST_KEY_PAIR);
    }),
  };
});

import './mocks/mockUserManagementClient.js';

export const testAddEventListener = vi.fn();
export const testRemoveEventListener = vi.fn();

Object.defineProperty(globalThis, 'window', {
  value: {
    crypto: crypto,
    location: {
      href: 'http://localhost',
      origin: 'http://localhost:3000',
    },
    addEventListener: testAddEventListener,
    removeEventListener: testRemoveEventListener,
  },
});
