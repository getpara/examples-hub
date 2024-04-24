import { StorageUtils } from '@usecapsule/core-sdk';

/**
 * Implements `StorageUtils` using `localStorage`.
 */
export class LocalStorage implements StorageUtils {
  get = (key: string): string | null => {
    return localStorage.getItem(key) || null;
  };
  set = (key: string, value: string): void => {
    localStorage.setItem(key, value);
  };
  removeItem = (key: string): void => {
    localStorage.removeItem(key);
  };
  clear = (prefix: string): void => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        localStorage.removeItem(key);
        i--;
      }
    }
  };
}
