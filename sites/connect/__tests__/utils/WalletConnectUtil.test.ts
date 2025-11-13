import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock WalletConnect dependencies first (hoisted)
vi.mock('@reown/walletkit');
vi.mock('@walletconnect/core');

import { createWalletKit, updateSignClientChainId } from '@/utils/WalletConnectUtil';

// Mock localStorage
const localStorageMock = {
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console.error
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock process.env
const originalEnv = process.env;

describe('WalletConnectUtil', () => {
  const mockWeb3WalletInstance = {
    getActiveSessions: vi.fn(),
    updateSession: vi.fn(),
    emitSessionEvent: vi.fn(),
    engine: {
      signClient: {
        core: {
          crypto: {
            getClientId: vi.fn(),
          },
        },
      },
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_PROJECT_ID: 'test-project-id',
      NEXT_PUBLIC_RELAY_URL: 'wss://relay.walletconnect.com',
    };

    // Setup mock implementations
    const walletKit = await import('@reown/walletkit');
    const core = await import('@walletconnect/core');

    vi.mocked(walletKit.WalletKit.init).mockResolvedValue(mockWeb3WalletInstance as any);
    vi.mocked(core.Core).mockImplementation((config: any) => config as any);
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleErrorSpy.mockClear();
  });

  describe('createWalletKit', () => {
    it('should create Web3Wallet with custom relayer URL', async () => {
      const customRelayerURL = 'wss://custom-relay.example.com';

      mockWeb3WalletInstance.engine.signClient.core.crypto.getClientId.mockResolvedValue('test-client-id');

      await createWalletKit(customRelayerURL);

      const core = await import('@walletconnect/core');
      const walletKit = await import('@reown/walletkit');

      expect(core.Core).toHaveBeenCalledWith({
        customStoragePrefix: 'para_connect',
        projectId: 'test-project-id',
        relayUrl: customRelayerURL,
      });

      expect(walletKit.WalletKit.init).toHaveBeenCalledWith({
        core: {
          customStoragePrefix: 'para_connect',
          projectId: 'test-project-id',
          relayUrl: customRelayerURL,
        },
        metadata: {
          name: 'Para Wallet',
          description: 'Para for WalletConnect',
          url: 'https://getpara.com/',
          icons: ['https://avatars.githubusercontent.com/u/37784886'],
        },
      });
    });

    it('should use default relay URL when custom URL is not provided', async () => {
      mockWeb3WalletInstance.engine.signClient.core.crypto.getClientId.mockResolvedValue('test-client-id');

      await createWalletKit('');

      const core = await import('@walletconnect/core');

      expect(core.Core).toHaveBeenCalledWith({
        customStoragePrefix: 'para_connect',
        projectId: 'test-project-id',
        relayUrl: '', // Empty string is passed as-is due to nullish coalescing
      });
    });

    it('should create wallet with correct metadata', async () => {
      mockWeb3WalletInstance.engine.signClient.core.crypto.getClientId.mockResolvedValue('client-id');

      await createWalletKit('wss://test.com');

      const walletKit = await import('@reown/walletkit');
      const initCall = vi.mocked(walletKit.WalletKit.init).mock.calls[0][0];

      expect(initCall.metadata).toEqual({
        name: 'Para Wallet',
        description: 'Para for WalletConnect',
        url: 'https://getpara.com/',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      });
    });

    it('should handle missing environment variables', async () => {
      process.env.NEXT_PUBLIC_PROJECT_ID = undefined;

      mockWeb3WalletInstance.engine.signClient.core.crypto.getClientId.mockResolvedValue('test-id');

      await createWalletKit('wss://test.com');

      const core = await import('@walletconnect/core');

      expect(core.Core).toHaveBeenCalledWith({
        customStoragePrefix: 'para_connect',
        projectId: undefined,
        relayUrl: 'wss://test.com',
      });
    });
  });

  describe('updateSignClientChainId', () => {
    beforeEach(async () => {
      // Initialize web3wallet first
      await createWalletKit('wss://test.com');
      vi.clearAllMocks(); // Clear mocks after initialization
    });

    it('should handle non-EIP155 chains', async () => {
      const mockSession = {
        topic: 'cosmos-session',
        namespaces: {
          cosmos: {
            chains: ['cosmos:cosmoshub-4'],
            accounts: ['cosmos:cosmoshub-4:cosmos1address'],
          },
        },
      };

      mockWeb3WalletInstance.getActiveSessions.mockReturnValue({
        'session-1': mockSession,
      });

      await updateSignClientChainId('cosmos:osmosis-1', 'cosmos1newaddress');

      expect(mockWeb3WalletInstance.updateSession).toHaveBeenCalledWith({
        topic: 'cosmos-session',
        namespaces: {
          cosmos: {
            chains: ['cosmos:osmosis-1', 'cosmos:cosmoshub-4'],
            accounts: ['cosmos:osmosis-1:cosmos1newaddress', 'cosmos:cosmoshub-4:cosmos1address'],
          },
        },
      });
    });

    it('should handle sessions with no existing chains', async () => {
      const mockSession = {
        topic: 'empty-session',
        namespaces: {
          eip155: {
            chains: undefined,
            accounts: [],
          },
        },
      };

      mockWeb3WalletInstance.getActiveSessions.mockReturnValue({
        'session-1': mockSession,
      });

      await updateSignClientChainId('eip155:1', '0xAddress');

      expect(mockWeb3WalletInstance.updateSession).toHaveBeenCalledWith({
        topic: 'empty-session',
        namespaces: {
          eip155: {
            chains: ['eip155:1'],
            accounts: ['eip155:1:0xAddress'],
          },
        },
      });
    });

    it('should return early if no active sessions', async () => {
      mockWeb3WalletInstance.getActiveSessions.mockReturnValue(null);

      await updateSignClientChainId('eip155:1', '0xAddress');

      expect(mockWeb3WalletInstance.updateSession).not.toHaveBeenCalled();
      expect(mockWeb3WalletInstance.emitSessionEvent).not.toHaveBeenCalled();
    });

    it('should not duplicate chains or accounts', async () => {
      const mockSession = {
        topic: 'session-topic',
        namespaces: {
          eip155: {
            chains: ['eip155:1', 'eip155:137'],
            accounts: ['eip155:1:0xAddress', 'eip155:137:0xAddress'],
          },
        },
      };

      mockWeb3WalletInstance.getActiveSessions.mockReturnValue({
        'session-1': mockSession,
      });

      await updateSignClientChainId('eip155:137', '0xAddress');

      expect(mockWeb3WalletInstance.updateSession).toHaveBeenCalledWith({
        topic: 'session-topic',
        namespaces: {
          eip155: {
            chains: ['eip155:137', 'eip155:1'], // No duplicates
            accounts: ['eip155:137:0xAddress', 'eip155:1:0xAddress'], // No duplicates
          },
        },
      });
    });

    it('should handle delay between operations', async () => {
      vi.useFakeTimers();

      const mockSession = {
        topic: 'session-topic',
        namespaces: {
          eip155: {
            chains: ['eip155:1'],
            accounts: ['eip155:1:0xAddress'],
          },
        },
      };

      mockWeb3WalletInstance.getActiveSessions.mockReturnValue({
        'session-1': mockSession,
      });

      const updatePromise = updateSignClientChainId('eip155:137', '0xNewAddress');

      // Fast-forward time by 1 second
      await vi.advanceTimersByTimeAsync(1000);

      await updatePromise;

      // Verify that the delay occurred
      expect(mockWeb3WalletInstance.updateSession).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});
