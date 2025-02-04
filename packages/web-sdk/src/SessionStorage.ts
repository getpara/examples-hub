import { StorageUtils } from '@getpara/core-sdk';

/**
 * Implements `StorageUtils` using `sessionStorage`.
 *
 * This class will eventually not be exported and should not be used
 * by consumers of the library.
 * @internal
 */
export class SessionStorage implements StorageUtils {
  get = (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(key) || null;
    }
    return null;
  };
  set = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, value);
    }
  };
  removeItem = (key: string): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  };
  clear = (prefix: string): void => {
    if (typeof window !== 'undefined') {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(prefix)) {
          sessionStorage.removeItem(key);
          i--;
        }
      }
    }
  };
}
