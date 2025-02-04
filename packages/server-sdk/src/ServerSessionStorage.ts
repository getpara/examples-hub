import type { StorageUtils } from '@getpara/core-sdk';

/**
 * Implements `StorageUtils` using a JavaScript object.
 * @internal
 */
export class ServerSessionStorage implements StorageUtils {
  private sessionStorage = {};
  get = (key: string): string | null => {
    return this.sessionStorage[key] || null;
  };
  set = (key: string, value: string): void => {
    this.sessionStorage[key] = value;
  };
  removeItem = (key: string): void => {
    delete this.sessionStorage[key];
  };
  clear = (prefix: string): void => {
    const keys = Object.keys(this.sessionStorage);
    for (let key in keys) {
      if (key && key.startsWith(prefix)) {
        this.removeItem(key);
      }
    }
  };
}
