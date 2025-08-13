import { vi } from 'vitest';
import type { PasskeyCreateRequest, PasskeyCreateResult, PasskeyGetRequest, PasskeyGetResult } from 'react-native-passkey';

let counter = 0;
const newId = () => `cred-${++counter}`;

const makeCreateResult = (id: string): PasskeyCreateResult => ({
  id,
  rawId: id,
  response: {
    clientDataJSON: 'eyJ0eXAiOiJKV1QifQ',
    attestationObject: 'YXR0ZXN0YXRpb24=',
  },
});

const makeGetResult = (id: string): PasskeyGetResult => ({
  id,
  rawId: id,
  response: {
    clientDataJSON: 'eyJ0eXAiOiJKV1QifQ',
    authenticatorData: 'YXV0aGRhdGE=',
    signature: 'c2lnbmF0dXJl',
    userHandle: 'dXNlcg==',
  },
});

export const Passkey = {
  create: vi.fn(async (_req: PasskeyCreateRequest) => makeCreateResult(newId())),
  createPlatformKey: vi.fn(async () => makeCreateResult(newId())),
  createSecurityKey: vi.fn(async () => makeCreateResult(newId())),

  get: vi.fn(async (_req: PasskeyGetRequest) => makeGetResult(newId())),
  getPlatformKey: vi.fn(async (_req: PasskeyGetRequest) => makeGetResult(newId())),
  getSecurityKey: vi.fn(async (_req: PasskeyGetRequest) => makeGetResult(newId())),

  isSupported: vi.fn(async () => true),

  reset: () => {
    vi.clearAllMocks();
    counter = 0;
  },
};
