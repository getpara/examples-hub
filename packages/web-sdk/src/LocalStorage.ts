import { StorageUtils } from '@usecapsule/core-sdk';

/**
 * Implements `StorageUtils` using `localStorage`.
 */
export class LocalStorage implements StorageUtils {
  get = (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key) || null;
    }
    return null;
  };
  set = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  };
  removeItem = (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  };
  clear = (prefix: string): void => {
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          localStorage.removeItem(key);
          i--;
        }
      }
    }
  };
}
