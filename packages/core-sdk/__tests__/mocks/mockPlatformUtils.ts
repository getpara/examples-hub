import { vi } from 'vitest';
import { PlatformUtils, StorageUtils } from '../../src';

class MockLocalStorage implements StorageUtils {
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

class MockSessionStorage implements StorageUtils {
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

export class MockPlatformUtils implements PlatformUtils {
  refresh = vi.fn().mockReturnValue({});

  getPrivateKey = vi.fn().mockReturnValue('getPrivateKey');

  keygen = vi.fn().mockReturnValue({});

  preKeygen = vi.fn().mockReturnValue({});

  signMessage = vi.fn().mockReturnValue({});

  signTransaction = vi.fn().mockReturnValue({});

  sendTransaction = vi.fn().mockReturnValue({});

  signHash = vi.fn().mockReturnValue({});

  ed25519Keygen = vi.fn().mockReturnValue({});

  ed25519PreKeygen = vi.fn().mockReturnValue({});

  ed25519Sign = vi.fn().mockReturnValue({});

  localStorage = new MockLocalStorage();

  sessionStorage = new MockSessionStorage();

  secureStorage = undefined;

  isSyncStorage = true;

  disableProviderModal = false;

  openPopup = vi.fn();
}
