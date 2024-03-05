import type { StorageUtils } from '@usecapsule/core-sdk';

/**
 * Implements `StorageUtils`
 * @internal
 */
export class ServerLocalStorage implements StorageUtils {
  private localStorage = {};
  get = (key: string): string | null => {
    return this.localStorage[key] || null;
  };
  set = (key: string, value: string): void => {
    this.localStorage[key] = value;
  };
  removeItem = (key: string): void => {
    delete this.localStorage[key];
  };
  clear = (prefix: string): void => {
    const keys = Object.keys(this.localStorage);
    for (let key in keys) {
      if (key && key.startsWith(prefix)) {
        this.removeItem(key);
      }
    }
  };
}
