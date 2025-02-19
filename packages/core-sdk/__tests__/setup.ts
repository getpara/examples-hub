import { vi } from 'vitest';

import './mocks/mockUserManagementClient.js';
import crypto from 'crypto';

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
