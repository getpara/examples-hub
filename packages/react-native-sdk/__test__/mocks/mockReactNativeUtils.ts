import { vi } from 'vitest';
import { PlatformUtils, TPregenIdentifierType, Ctx, SignatureRes } from '@getpara/web-sdk';
import { BackupKitEmailProps, SDKType, WalletType } from '@getpara/user-management-client';

import { mockAsyncStorage } from './mockAsyncStorage';
vi.mock('@react-native-async-storage/async-storage', () => ({ default: mockAsyncStorage }));
import { AsyncStorage } from '../../src/AsyncStorage';

export class MockReactNativeUtils implements PlatformUtils {
  sdkType: SDKType;
  disableProviderModal?: boolean | undefined = false;
  localStorage = new AsyncStorage();
  sessionStorage = {
    clear: vi.fn(),
    get: vi.fn(),
    removeItem: vi.fn(),
    set: vi.fn(),
  };
  secureStorage = {
    clear: vi.fn(),
    get: vi.fn(),
    removeItem: vi.fn(),
    set: vi.fn(),
  };
  isSyncStorage = false;

  reset() {
    vi.clearAllMocks();
  }

  generateBlumPrimes = vi.fn().mockRejectedValue(new Error('method not implemented'));

  keygen = vi
    .fn()
    .mockImplementation(
      async (
        _ctx: Ctx,
        _userId: string,
        _type: Exclude<WalletType, WalletType.SOLANA>,
        _secretKey: string | null,
        _sessionCookie: string,
        _emailProps?: BackupKitEmailProps | undefined,
      ): Promise<{ signer: string; walletId: string }> => {
        return { signer: 'mock-signer', walletId: 'mock-wallet-id' };
      },
    );

  refresh = vi.fn().mockRejectedValue(new Error('Method not implemented.'));

  preKeygen = vi.fn().mockRejectedValue(new Error('Method not implemented.'));

  getPrivateKey = vi.fn().mockRejectedValue(new Error('Method not implemented.'));

  openPopup = vi.fn().mockImplementation((_popupUrl: string): any => {
    throw new Error('Method not implemented.');
  });

  baseSignTransaction = vi
    .fn()
    .mockImplementation(
      async (
        _ctx: Ctx,
        _userId: string,
        _walletId: string,
        _protocolId: string,
        _share: string,
        _rlpEncodedTxBase64: string,
        _chainId: string,
        _isDKLS?: boolean,
      ): Promise<SignatureRes> => {
        return { signature: 'mock-signature' };
      },
    );

  sendTransaction = vi
    .fn()
    .mockImplementation(
      async (
        _ctx: Ctx,
        _userId: string,
        _walletId: string,
        _share: string,
        _rlpEncodedTxBase64: string,
        _chainId: string,
        _sessionCookie: string,
        _isDKLS?: boolean,
      ): Promise<SignatureRes> => {
        return { signature: 'mock-signature' };
      },
    );

  signHash = vi.fn().mockRejectedValue(new Error('not implemented'));

  signMessage = vi
    .fn()
    .mockImplementation(
      async (
        _ctx: Ctx,
        _userId: string,
        _walletId: string,
        _share: string,
        _messageBase64: string,
        _sessionCookie: string,
        _isDKLS?: boolean,
      ): Promise<SignatureRes> => {
        return { signature: 'mock-message-signature' };
      },
    );

  signTransaction = vi
    .fn()
    .mockImplementation(
      async (
        _ctx: Ctx,
        _userId: string,
        _walletId: string,
        _share: string,
        _rlpEncodedTxBase64: string,
        _chainId: string,
        _sessionCookie: string,
        _isDKLS?: boolean,
      ): Promise<SignatureRes> => {
        return { signature: 'mock-transaction-signature' };
      },
    );

  ed25519Keygen = vi.fn().mockImplementation(
    async (
      _ctx: Ctx,
      _userId: string,
      _sessionCookie: string,
      _emailProps?: BackupKitEmailProps,
    ): Promise<{
      signer: string;
      walletId: string;
    }> => {
      return { signer: 'mock-ed25519-signer', walletId: 'mock-ed25519-wallet-id' };
    },
  );

  ed25519PreKeygen = vi.fn().mockImplementation(
    async (
      _ctx: Ctx,
      _pregenIdentifier: string,
      _pregenIdentifierType: TPregenIdentifierType,
      _sessionCookie: string,
    ): Promise<{
      signer: string;
      walletId: string;
    }> => {
      return { signer: 'mock-ed25519-pregen-signer', walletId: 'mock-ed25519-pregen-wallet-id' };
    },
  );

  ed25519Sign = vi
    .fn()
    .mockImplementation(
      async (
        _ctx: Ctx,
        _userId: string,
        _walletId: string,
        _share: string,
        _base64Bytes: string,
        _sessionCookie: string,
      ): Promise<SignatureRes> => {
        return { signature: 'mock-ed25519-signature' };
      },
    );
}

export default new MockReactNativeUtils();
