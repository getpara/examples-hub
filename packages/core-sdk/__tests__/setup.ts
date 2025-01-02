import './mocks/mockUserManagementClient.js';
import crypto from 'crypto';

Object.defineProperty(globalThis, 'window', {
  value: {
    crypto: crypto,
    location: {
      href: 'http://localhost',
    },
  },
});
