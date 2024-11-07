import { vi } from 'vitest';
import { PlatformUtils, StorageUtils } from '../../src/index.js';
import {
  PREGEN_WALLET_EMAIL_KEYGEN_RES,
  SOLANA_PREGEN_WALLET_KEYGEN_RES,
  SOLANA_WALLET_KEYGEN_RES,
  WALLET_KEYGEN_RES,
} from '../constants.js';

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

export const mockKeygen = vi.fn().mockReturnValue(WALLET_KEYGEN_RES);
export const mockPreKeygen = vi.fn().mockReturnValue(PREGEN_WALLET_EMAIL_KEYGEN_RES);

export class MockPlatformUtils implements PlatformUtils {
  refresh = vi.fn().mockReturnValue({ signer: 'test-refresh-signer' });

  getPrivateKey = vi.fn().mockReturnValue('getPrivateKey');

  keygen = mockKeygen;

  preKeygen = mockPreKeygen;

  signMessage = vi.fn().mockReturnValue({});

  signTransaction = vi.fn().mockReturnValue({});

  sendTransaction = vi.fn().mockReturnValue({});

  signHash = vi.fn().mockReturnValue({});

  ed25519Keygen = vi.fn().mockReturnValue(SOLANA_WALLET_KEYGEN_RES);

  ed25519PreKeygen = vi.fn().mockReturnValue(SOLANA_PREGEN_WALLET_KEYGEN_RES);

  ed25519Sign = vi.fn().mockReturnValue({});

  localStorage = new MockLocalStorage();

  sessionStorage = new MockSessionStorage();

  secureStorage = undefined;

  isSyncStorage = true;

  disableProviderModal = false;

  openPopup = vi.fn();
}
