import { vi } from 'vitest';
import { PlatformUtils, StorageUtils } from '../../src/index.js';
import {
  PREGEN_WALLET_EMAIL_KEYGEN_RES,
  SOLANA_PREGEN_WALLET_KEYGEN_RES,
  SOLANA_WALLET_KEYGEN_RES,
  WALLET_KEYGEN_RES,
} from '../constants.js';
import { SDKType } from '@getpara/user-management-client';

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

export const mockRefresh = vi.fn();
export const mockGetPrivateKey = vi.fn();
export const mockKeygen = vi.fn();
export const mockPreKeygen = vi.fn();
export const mockSignMessage = vi.fn();
export const mockSignTransaction = vi.fn();
export const mockSendTransaction = vi.fn();
export const mockSignHash = vi.fn();
export const mockEd25519Keygen = vi.fn();
export const mockEd25519PreKeygen = vi.fn();
export const mockEd25519Sign = vi.fn();
export const mockRefreshShare = vi.fn();

export const resetPlatformMocks = () => {
  mockRefresh.mockReturnValue({ signer: 'test-refresh-signer', protocolId: 'protocolId' });
  mockGetPrivateKey.mockReturnValue('getPrivateKey');
  mockKeygen.mockResolvedValue(WALLET_KEYGEN_RES);
  mockPreKeygen.mockResolvedValue(PREGEN_WALLET_EMAIL_KEYGEN_RES);
  mockSignMessage.mockReturnValue({ signature: 'signature' });
  mockSignTransaction.mockReturnValue({ signature: 'signature' });
  mockSendTransaction.mockReturnValue({ signature: 'signature' });
  mockSignHash.mockReturnValue({ signature: 'signature' });
  mockEd25519Keygen.mockResolvedValue(SOLANA_WALLET_KEYGEN_RES);
  mockEd25519PreKeygen.mockResolvedValue(SOLANA_PREGEN_WALLET_KEYGEN_RES);
  mockEd25519Sign.mockReturnValue({ signature: 'signature' });
  mockRefreshShare.mockResolvedValue('recoverySecret');
};

resetPlatformMocks();

export class MockPlatformUtils implements PlatformUtils {
  constructor(isAsyncStorage = false) {
    this.isSyncStorage = !isAsyncStorage;
  }

  sdkType: SDKType = 'WEB';

  refresh = mockRefresh;

  getPrivateKey = mockGetPrivateKey;

  keygen = mockKeygen;

  preKeygen = mockPreKeygen;

  signMessage = mockSignMessage;

  signTransaction = mockSignTransaction;

  sendTransaction = mockSendTransaction;

  signHash = mockSignHash;

  ed25519Keygen = mockEd25519Keygen;

  ed25519PreKeygen = mockEd25519PreKeygen;

  ed25519Sign = mockEd25519Sign;

  refreshShare = mockRefreshShare;

  localStorage = new MockLocalStorage();

  sessionStorage = new MockSessionStorage();

  secureStorage = undefined;

  isSyncStorage = true;

  disableProviderModal = false;

  openPopup = vi.fn();
}
