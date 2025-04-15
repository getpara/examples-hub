import './mocks/mockUserManagementClient.js';
import './mocks/mockCoreSdk.js';
import './mocks/mockGlobalWalletUtils.js';
import crypto from 'crypto';
import { vi } from 'vitest';
import base64url from 'base64url';
import {
  COSMOS_PREFIX,
  PARTNER,
  TEST_ATTESTATION_OBJECT_STRING,
  WINDOW_INNER_HEIGHT,
  WINDOW_INNER_WIDTH,
} from './constants';
import { Ctx, Environment, initClient } from '@getpara/core-sdk';
import { mockMPCClient } from './mocks/mockMPCClient.js';

export const mockCreateCred = vi.fn(async () => {
  return {
    response: {
      attestationObject: base64url.toBuffer(TEST_ATTESTATION_OBJECT_STRING),
      getPublicKeyAlgorithm: () => -7,
    } as any,
  } as any;
});

export const mockGetCred = vi.fn();

Object.defineProperty(globalThis, 'navigator', {
  value: {
    credentials: {
      create: mockCreateCred,
      get: mockGetCred,
      preventSilentAccess: vi.fn(),
      store: vi.fn(),
    },
  } as any,
  writable: true,
});

export const mockWindowOpen = vi.fn(url => ({
  location: {
    href: url,
  },
}));

export const windowMockValue = {
  crypto: crypto,
  location: {
    href: 'http://localhost',
  },
  open: mockWindowOpen,
  innerWidth: WINDOW_INNER_HEIGHT,
  innerHeight: WINDOW_INNER_WIDTH,
  screenX: 0,
  screenY: 0,
  PublicKeyCredential: {
    isUserVerifyingPlatformAuthenticatorAvailable: vi.fn(),
  },
};
Object.defineProperty(globalThis, 'window', {
  value: windowMockValue,
  configurable: true,
});

export const documentElementMockValue = {
  clientWidth: WINDOW_INNER_HEIGHT,
  clientHeight: WINDOW_INNER_WIDTH,
};
Object.defineProperty(globalThis, 'document', {
  value: { documentElement: documentElementMockValue },
  configurable: true,
});
Object.defineProperty(globalThis, 'screen', {
  value: {
    width: WINDOW_INNER_HEIGHT,
    height: WINDOW_INNER_WIDTH,
  },
  configurable: true,
});

export const mockGoRun = vi.fn();
Object.defineProperty(globalThis, 'self', {
  value: { Go: vi.fn(() => ({ run: mockGoRun })) },
});
Object.defineProperty(globalThis, 'Go', {
  value: vi.fn(() => ({ run: mockGoRun })),
  configurable: true,
  writable: true,
});
vi.mock('../src/wasm/wasm_exec.js', () => ({}));

export const mockWASMInit = vi.fn(() => ({ instance: 'test' }));
Object.defineProperty(globalThis, 'WebAssembly', {
  value: { instantiate: mockWASMInit },
});

export const TEST_CTX: Ctx = {
  env: Environment.DEV,
  client: initClient({ env: Environment.DEV }),
  disableWebSockets: false,
  useDKLS: true,
  apiKey: PARTNER.apiKey,
  cosmosPrefix: COSMOS_PREFIX,
  disableWorkers: false,
  mpcComputationClient: mockMPCClient,
  wasmOverride: undefined,
};
