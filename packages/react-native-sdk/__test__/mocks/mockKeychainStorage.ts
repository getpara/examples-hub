import { vi } from 'vitest';

const storage: { [key: string]: { username: string; password: string } } = {};

export const mockKeychainStorage = {
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'WhenUnlocked',
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AfterFirstUnlockThisDeviceOnly',
  },
  SECURITY_LEVEL: {
    ANY: 'any',
  },
  STORAGE_TYPE: {
    AES_GCM_NO_AUTH: 'aes-gcm-no-auth',
  },
  getGenericPassword: vi.fn(async (serviceOrOptions?: string | { service?: string }) => {
    const options = typeof serviceOrOptions === 'string' ? { service: serviceOrOptions } : serviceOrOptions;
    const service = options?.service;
    return service && storage[service] ? storage[service] : false;
  }),
  setGenericPassword: vi.fn(async (username: string, password: string, serviceOrOptions?: string | { service?: string }) => {
    const options = typeof serviceOrOptions === 'string' ? { service: serviceOrOptions } : serviceOrOptions;
    const service = options?.service;
    if (service) {
      storage[service] = { username, password };
      return { service, storage: storage[service] };
    }
    return false;
  }),
  resetGenericPassword: vi.fn(async (serviceOrOptions?: string | { service?: string }) => {
    const options = typeof serviceOrOptions === 'string' ? { service: serviceOrOptions } : serviceOrOptions;
    const service = options?.service;
    if (service && storage[service]) {
      delete storage[service];
      return true;
    }
    return false;
  }),
  getAllGenericPasswordServices: vi.fn(async () => Object.keys(storage)),
  clear: () => Object.keys(storage).forEach(k => delete storage[k]),
};
