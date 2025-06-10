import { vi } from 'vitest';

const storage: { [key: string]: string | null } = {};

export const mockAsyncStorage = {
  getItem: vi.fn(async (key: string) => storage[key] || null),
  setItem: vi.fn(async (key: string, value: string) => {
    storage[key] = value;
  }),
  removeItem: vi.fn(async (key: string) => {
    delete storage[key];
  }),
  clear: vi.fn(async () => {
    Object.keys(storage).forEach(key => delete storage[key]);
  }),
  getAllKeys: vi.fn(async (callback?: (error?: Error, keys?: readonly string[]) => void) => {
    const keys = Object.keys(storage);
    if (callback) {
      callback(undefined, keys);
    }
    return keys;
  }),
};
