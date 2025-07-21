import { vi, describe, it, expect, beforeEach } from 'vitest';
import { WalletScheme, WalletType, KeyShareType } from '@getpara/user-management-client';

import mockAsyncStorage from './mocks/mockAsyncStorage';
import mockKeychainStorage from './mocks/mockKeychainStorage';
import { ParaSignerModule as mockParaSignerModule } from './mocks/mockParaSignerModule';

vi.mock('react-native', () => ({
  NativeModules: {
    ParaSignerModule: mockParaSignerModule,
  },
}));

vi.mock('../src/AsyncStorage', () => ({
  AsyncStorage: vi.fn().mockImplementation(() => mockAsyncStorage),
}));

vi.mock('../src/KeychainStorage', () => ({
  KeychainStorage: vi.fn().mockImplementation(() => mockKeychainStorage),
}));

import { ReactNativeUtils } from '../src/react-native/ReactNativeUtils';

describe('ReactNativeUtils', () => {
  let utils: ReactNativeUtils;
  let mockCtx: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCtx = {
      client: {
        createWallet: vi.fn().mockResolvedValue({
          walletId: 'mock-wallet-id',
          protocolId: 'mock-protocol-id',
        }),
        sendTransaction: vi.fn().mockResolvedValue({
          data: { protocolId: 'mock-protocol-id' },
        }),
        signTransaction: vi.fn().mockResolvedValue({
          data: { protocolId: 'mock-protocol-id' },
        }),
        preSignMessage: vi.fn().mockResolvedValue({
          protocolId: 'mock-protocol-id',
        }),
        createPregenWallet: vi.fn().mockResolvedValue({
          walletId: 'mock-wallet-id',
          protocolId: 'mock-protocol-id',
        }),
      },
      mpcComputationClient: {
        post: vi.fn().mockResolvedValue({
          data: {
            signer: 'mock-server-signer',
            signature: 'mock-server-signature',
          },
        }),
      },
      useDKLS: false,
    };

    utils = new ReactNativeUtils();
  });

  describe('storage initialization', () => {
    it('should initialize with the correct storage instances', () => {
      expect(utils.localStorage).toBeDefined();
      expect(utils.sessionStorage).toBeDefined();
      expect(utils.secureStorage).toBeDefined();
      expect(utils.isSyncStorage).toBe(false);
    });
  });

  describe('keygen', () => {
    it('should create wallet and get signer from native module when not using DKLS', async () => {
      mockCtx.mpcComputationClient = null;
      const result = await utils.keygen(mockCtx, 'user-123', WalletType.EVM, null, 'session-cookie');

      expect(mockCtx.client.createWallet).toHaveBeenCalledWith('user-123', {
        type: WalletType.EVM,
        useTwoSigners: true,
        scheme: WalletScheme.CGGMP,
      });

      expect(mockParaSignerModule.createAccount).toHaveBeenCalledWith(
        'mock-wallet-id',
        'mock-protocol-id',
        KeyShareType.USER,
        'user-123',
      );

      expect(result).toEqual({
        signer: 'signer-cggmp-mock-wallet-id-mock-protocol-id',
        walletId: 'mock-wallet-id',
      });
    });

    it('should create wallet and get signer from native module when using DKLS', async () => {
      mockCtx.useDKLS = true;
      mockCtx.mpcComputationClient = null;

      const result = await utils.keygen(mockCtx, 'user-123', WalletType.EVM, null, 'session-cookie');

      expect(mockCtx.client.createWallet).toHaveBeenCalledWith('user-123', {
        type: WalletType.EVM,
        useTwoSigners: true,
        scheme: WalletScheme.DKLS,
      });

      expect(mockParaSignerModule.dklsCreateAccount).toHaveBeenCalledWith(
        'mock-wallet-id',
        'mock-protocol-id',
        KeyShareType.USER,
        'user-123',
      );

      expect(result).toEqual({
        signer: 'signer-dkls-mock-wallet-id-mock-protocol-id',
        walletId: 'mock-wallet-id',
      });
    });

    it('should use mpcComputationClient when available and not using DKLS', async () => {
      const result = await utils.keygen(mockCtx, 'user-123', WalletType.EVM, null, 'session-cookie');

      expect(mockCtx.mpcComputationClient.post).toHaveBeenCalledWith('/wallets', {
        userId: 'user-123',
        walletId: 'mock-wallet-id',
        protocolId: 'mock-protocol-id',
      });

      expect(result).toEqual({
        signer: 'mock-server-signer',
        walletId: 'mock-wallet-id',
      });
    });
  });

  describe('ed25519Keygen', () => {
    it('should create ED25519 wallet and get signer from native module', async () => {
      const result = await utils.ed25519Keygen(mockCtx, 'user-123', 'session-cookie');

      expect(mockCtx.client.createWallet).toHaveBeenCalledWith('user-123', {
        scheme: WalletScheme.ED25519,
        type: WalletType.SOLANA,
      });

      expect(mockParaSignerModule.ed25519CreateAccount).toHaveBeenCalledWith('mock-wallet-id', 'mock-protocol-id');

      expect(result).toEqual({
        signer: 'signer-ed25519-mock-wallet-id',
        walletId: 'mock-wallet-id',
      });
    });
  });

  describe('ed25519PreKeygen', () => {
    it('should create pregen ED25519 wallet and get signer', async () => {
      const result = await utils.ed25519PreKeygen(mockCtx, 'email@example.com', 'EMAIL', 'session-cookie');

      expect(mockCtx.client.createPregenWallet).toHaveBeenCalledWith({
        pregenIdentifier: 'email@example.com',
        pregenIdentifierType: 'EMAIL',
        scheme: WalletScheme.ED25519,
        type: WalletType.SOLANA,
      });

      expect(mockParaSignerModule.ed25519CreateAccount).toHaveBeenCalledWith('mock-wallet-id', 'mock-protocol-id');

      expect(result).toEqual({
        signer: 'signer-ed25519-mock-wallet-id',
        walletId: 'mock-wallet-id',
      });
    });
  });

  describe('signMessage', () => {
    it('should sign message using native module when not using DKLS', async () => {
      mockCtx.mpcComputationClient = null; // Disable server-side signing

      const result = await utils.signMessage(
        mockCtx,
        'user-123',
        'wallet-123',
        'share-data',
        'base64-message',
        'session-cookie',
      );

      expect(mockCtx.client.preSignMessage).toHaveBeenCalledWith('user-123', 'wallet-123', 'base64-message');

      expect(mockParaSignerModule.signMessage).toHaveBeenCalledWith(
        'mock-protocol-id',
        'share-data',
        'base64-message',
        'user-123',
      );

      expect(result).toEqual({
        signature: 'cggmp-msg-deadbeef',
      });
    });

    it('should sign message using DKLS native module when using DKLS', async () => {
      mockCtx.mpcComputationClient = null; // Disable server-side signing

      const result = await utils.signMessage(
        mockCtx,
        'user-123',
        'wallet-123',
        'share-data',
        'base64-message',
        'session-cookie',
        true, // isDKLS = true
      );

      expect(mockCtx.client.preSignMessage).toHaveBeenCalledWith('user-123', 'wallet-123', 'base64-message');

      expect(mockParaSignerModule.dklsSignMessage).toHaveBeenCalledWith(
        'mock-protocol-id',
        'share-data',
        'base64-message',
        'user-123',
      );

      expect(result).toEqual({
        signature: 'dkls-msg-deadbeef',
      });
    });

    it('should return signature as-is when module does not prefix with 0x', async () => {
      mockCtx.mpcComputationClient = null;
      (mockParaSignerModule.signMessage as any).mockResolvedValueOnce('raw-sig');

      const result = await utils.signMessage(
        mockCtx,
        'user-123',
        'wallet-123',
        'share-data',
        'base64-message',
        'session-cookie',
      );

      expect(result).toEqual({ signature: 'raw-sig' });
    });

    it('should use mpcComputationClient when available and not using DKLS', async () => {
      const result = await utils.signMessage(
        mockCtx,
        'user-123',
        'wallet-123',
        'share-data',
        'base64-message',
        'session-cookie',
      );

      expect(mockCtx.client.preSignMessage).toHaveBeenCalledWith('user-123', 'wallet-123', 'base64-message');

      expect(mockCtx.mpcComputationClient.post).toHaveBeenCalledWith('/wallets/wallet-123/messages/sign', {
        userId: 'user-123',
        protocolId: 'mock-protocol-id',
        message: 'base64-message',
        signer: 'share-data',
      });

      expect(result).toEqual({
        signature: 'mock-server-signature',
      });
    });
  });

  describe('ed25519Sign', () => {
    it('should sign using ED25519 module', async () => {
      const result = await utils.ed25519Sign(
        mockCtx,
        'user-123',
        'wallet-123',
        'share-data',
        'base64-bytes',
        'session-cookie',
      );

      expect(mockCtx.client.preSignMessage).toHaveBeenCalledWith(
        'user-123',
        'wallet-123',
        'base64-bytes',
        WalletScheme.ED25519,
      );

      expect(mockParaSignerModule.ed25519Sign).toHaveBeenCalledWith('mock-protocol-id', 'share-data', 'base64-bytes');

      expect(result).toEqual({
        signature: 'ZWQyNTUxOS1zaWc=',
      });
    });
  });

  describe('sendTransaction', () => {
    it('should send transaction using native module when not using DKLS', async () => {
      mockCtx.mpcComputationClient = null; // Disable server-side signing

      const result = await utils.sendTransaction(
        mockCtx,
        'user-123',
        'wallet-123',
        'share-data',
        'base64-tx',
        'chain-123',
        'session-cookie',
      );

      expect(mockCtx.client.sendTransaction).toHaveBeenCalledWith('user-123', 'wallet-123', {
        transaction: 'base64-tx',
        chainId: 'chain-123',
      });

      expect(mockParaSignerModule.sendTransaction).toHaveBeenCalledWith(
        'mock-protocol-id',
        'share-data',
        'base64-tx',
        'user-123',
      );

      expect(result).toEqual({
        signature: 'cggmp-tx-deadbeef',
      });
    });

    it('should send transaction using DKLS native module when using DKLS', async () => {
      mockCtx.mpcComputationClient = null; // Disable server-side signing

      const result = await utils.sendTransaction(
        mockCtx,
        'user-123',
        'wallet-123',
        'share-data',
        'base64-tx',
        'chain-123',
        'session-cookie',
        true, // isDKLS = true
      );

      expect(mockCtx.client.sendTransaction).toHaveBeenCalledWith('user-123', 'wallet-123', {
        transaction: 'base64-tx',
        chainId: 'chain-123',
      });

      expect(mockParaSignerModule.dklsSendTransaction).toHaveBeenCalledWith(
        'mock-protocol-id',
        'share-data',
        'base64-tx',
        'user-123',
      );

      expect(result).toEqual({
        signature: 'dkls-tx-deadbeef',
      });
    });
  });

  describe('signTransaction', () => {
    it('should sign transaction through the appropriate flow', async () => {
      const result = await utils.signTransaction(
        mockCtx,
        'user-123',
        'wallet-123',
        'share-data',
        'base64-tx',
        'chain-123',
        'session-cookie',
      );

      expect(mockCtx.client.signTransaction).toHaveBeenCalledWith('user-123', 'wallet-123', {
        transaction: 'base64-tx',
        chainId: 'chain-123',
      });

      expect(result).toEqual({
        signature: 'mock-server-signature',
      });
    });
  });

  describe('initializeWorker', () => {
    it('should complete without error', async () => {
      await expect(utils.initializeWorker(mockCtx)).resolves.toBeUndefined();
    });
  });

  describe('unimplemented methods', () => {
    it('should throw for generateBlumPrimes', async () => {
      await expect(utils.generateBlumPrimes(mockCtx)).rejects.toThrow('method not implemented');
    });

    it('should throw for refresh', () => {
      expect(() => utils.refresh(mockCtx, '', '', '', '')).toThrow('Method not implemented.');
    });

    it('should throw for preKeygen', () => {
      expect(() => utils.preKeygen(mockCtx, '', '', null, '')).toThrow('Method not implemented.');
    });

    it('should throw for getPrivateKey', () => {
      expect(() => utils.getPrivateKey(mockCtx, '', '', '', '')).toThrow('Method not implemented.');
    });

    it('should throw for openPopup', () => {
      expect(() => utils.openPopup('')).toThrow('Method not implemented.');
    });

    it('should throw for signHash', async () => {
      await expect(utils.signHash('', '')).rejects.toThrow('not implemented');
    });
  });
});
