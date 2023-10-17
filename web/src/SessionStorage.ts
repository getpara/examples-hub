import { StorageUtils } from './core/StorageUtils';

/**
 * Implements `StorageUtils` using `sessionStorage`.
 *
 * This class will eventually not be exported and should not be used
 * by consumers of the library.
 * @internal
 */
export class SessionStorage implements StorageUtils {
  get = (key: string): string | null => {
    return sessionStorage.getItem(key) || null;
  };
  set = (key: string, value: string): void => {
    sessionStorage.setItem(key, value);
  };
  removeItem = (key: string): void => {
    sessionStorage.removeItem(key);
  }
  clear = (prefix: string): void => {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(prefix)) {
        sessionStorage.removeItem(key);
        i--;
      }
    }
  }
}
