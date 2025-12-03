import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountSendProvider, useSend } from '../../../../../src/modal/components/Account/AccountSend/context';
import { MockPara } from '../../../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY, TEST_USER_ID, TEST_WALLET } from '../../../../constants';
import type { ProfileBalance, EstimateTransactionResult } from '@getpara/shared';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const mockSetStep = vi.fn();
const mockSetSendTx = vi.fn();
const mockSetSelectedWallet = vi.fn();

// Use the actual TEST_WALLET address to ensure matching
const TEST_WALLET_ADDRESS = TEST_WALLET.address!;

const mockProfileBalance: ProfileBalance = {
  wallets: [
    {
      type: 'EVM',
      networks: [],
      address: TEST_WALLET_ADDRESS,
      formattedValue: '$4000.00',
      assets: [
        {
          metadata: {
            symbol: 'ETH',
            name: 'Ethereum',
            price: {
              value: 2000,
              currency: 'USD',
            },
          },
          quantity: 1.5,
          networks: [
            {
              metadata: {
                evmChainId: '1',
                internalId: 'ETHEREUM',
                explorer: { name: 'Etherscan', url: 'https://etherscan.io', txUrlFormat: 'https://etherscan.io/tx/{HASH}' },
              },
              quantity: 1.5,
              value: {
                value: 3000,
                currency: 'USD',
              },
              contractAddress: undefined,
            },
          ],
        },
        {
          metadata: {
            symbol: 'USDC',
            name: 'USD Coin',
            price: {
              value: 1,
              currency: 'USD',
            },
          },
          quantity: 1000,
          networks: [
            {
              metadata: {
                evmChainId: '1',
                internalId: 'ETHEREUM',
                explorer: { name: 'Etherscan', url: 'https://etherscan.io', txUrlFormat: 'https://etherscan.io/tx/{HASH}' },
              },
              quantity: 1000,
              value: {
                value: 1000,
                currency: 'USD',
              },
              contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            },
          ],
        },
      ],
    },
  ],
  formattedValue: '$4000.00',
  value: {
    value: 4000,
    currency: 'USD',
  },
};

const mockEstimateResult: EstimateTransactionResult = {
  result: {
    txSerialized: '0x1234567890abcdef',
    message: undefined,
  },
  feeAmount: '0.001 ETH',
  transferAmount: '1.0 ETH',
  error: null,
};

let para: MockPara;
let mockEstimateSendTransaction: ReturnType<typeof vi.fn>;
let mockBroadcastSendTransaction: ReturnType<typeof vi.fn>;
let mockSignMessageAsync: ReturnType<typeof vi.fn>;
let mockSignTransactionAsync: ReturnType<typeof vi.fn>;

vi.mock('../../../../../src/provider/hooks/utils/useInternalClient', () => ({
  useInternalClient: () => para,
}));

const mockUseProfileBalance = vi.fn(() => ({
  data: mockProfileBalance,
  isLoading: false,
  isSuccess: true,
}));

vi.mock('../../../../../src/provider/hooks/queries/useProfileBalance', () => ({
  useProfileBalance: () => mockUseProfileBalance(),
}));

vi.mock('../../../../../src/provider/hooks/mutations/useSignMessage', () => ({
  useSignMessage: () => ({
    signMessageAsync: mockSignMessageAsync,
  }),
}));

vi.mock('../../../../../src/provider/hooks/mutations/useSignTransaction', () => ({
  useSignTransaction: () => ({
    signTransactionAsync: mockSignTransactionAsync,
  }),
}));

const mockUseWalletState = vi.fn();

vi.mock('../../../../../src/provider/hooks/utils/useWalletState', () => ({
  useWalletState: () => mockUseWalletState(),
}));

vi.mock('../../../../../src/modal/stores', () => ({
  useModalStore: (getter: (state: any) => any) =>
    getter({
      setStep: mockSetStep,
      setSendTx: mockSetSendTx,
    }),
}));

vi.mock('../../../../../src/provider/hooks/utils/useClient', () => ({
  useClient: () => para,
}));

describe('AccountSendContext', () => {
  let availableWalletsSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    para = new MockPara(Environment.DEV, API_KEY);
    para.userId = TEST_USER_ID;

    // Mock availableWallets getter
    availableWalletsSpy = vi.spyOn(para, 'availableWallets', 'get').mockReturnValue([TEST_WALLET as any]);

    mockEstimateSendTransaction = vi.fn().mockResolvedValue(mockEstimateResult);
    mockBroadcastSendTransaction = vi.fn().mockResolvedValue({ error: null });
    mockSignMessageAsync = vi.fn().mockResolvedValue({ signature: 'signature123' });
    mockSignTransactionAsync = vi.fn().mockResolvedValue({ signature: 'signature456' });

    para.ctx = {
      client: {
        estimateSendTransaction: mockEstimateSendTransaction,
        broadcastSendTransaction: mockBroadcastSendTransaction,
      },
    } as any;

    // Reset mocks to default values - assume balances and selectedWallet are available on load
    vi.clearAllMocks();

    // Set up mocks BEFORE any tests run - these will be used by the component
    mockUseProfileBalance.mockReturnValue({
      data: mockProfileBalance,
      isLoading: false,
      isSuccess: true,
    });

    mockUseWalletState.mockReturnValue({
      selectedWallet: {
        id: TEST_WALLET.id,
        address: TEST_WALLET_ADDRESS,
        type: TEST_WALLET.type,
      },
      setSelectedWallet: mockSetSelectedWallet,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AccountSendProvider step="SEND_FORM">{children}</AccountSendProvider>
    </QueryClientProvider>
  );

  describe('initialization', () => {
    it('should provide context values', () => {
      const { result } = renderHook(() => useSend(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.step).toBe('SEND_FORM');
      expect(result.current.sendMetadata).toBeDefined();
      expect(result.current.destinationAddress).toBe('');
      expect(result.current.transferValue).toBe(0);
      expect(result.current.transferAmount).toBe(0);
      expect(result.current.isMax).toBe(false);
      expect(result.current.estimate).toBeNull();
      expect(result.current.broadcast).toBeNull();
    });

    it('should initialize with default sendMetadata for EVM wallet', () => {
      // Balances and selectedWallet are available on load, so sendMetadata should be initialized
      const { result } = renderHook(() => useSend(), { wrapper });

      expect(result.current.sendMetadata.asset).toBeTruthy();
      expect(result.current.sendMetadata.asset?.metadata?.symbol).toBe('ETH');
      expect(result.current.sendMetadata.network).toBeTruthy();
      expect(result.current.sendMetadata.network?.metadata?.internalId).toBe('ETHEREUM');
    });

    it('should initialize with null sendMetadata for COSMOS wallet', async () => {
      availableWalletsSpy.mockReturnValue([{ ...TEST_WALLET, type: 'COSMOS' } as any]);
      mockUseWalletState.mockReturnValue({
        selectedWallet: {
          id: TEST_WALLET.id,
          address: TEST_WALLET_ADDRESS,
          type: 'COSMOS',
        },
        setSelectedWallet: mockSetSelectedWallet,
      });

      const { result } = renderHook(() => useSend(), { wrapper });

      await waitFor(() => {
        expect(result.current.sendMetadata.asset).toBeNull();
        expect(result.current.sendMetadata.network).toBeNull();
      });
    });
  });

  describe('optionsType', () => {
    it('should return MULTIPLE when wallet has multiple assets', async () => {
      const { result } = renderHook(() => useSend(), { wrapper });

      await waitFor(() => {
        expect(result.current.optionsType).toBe('MULTIPLE');
      });
    });

    it('should return SINGLE_ASSET when wallet has one asset with multiple networks', async () => {
      const singleAssetBalance: ProfileBalance = {
        wallets: [
          {
            type: 'EVM',
            formattedValue: '$1000.00',
            address: TEST_WALLET_ADDRESS,
            assets: [
              {
                metadata: {
                  symbol: 'ETH',
                  name: 'Ethereum',
                  price: {
                    value: 2000,
                    currency: 'USD',
                  },
                },
                quantity: 2,
                networks: [
                  {
                    metadata: {
                      evmChainId: '1',
                      internalId: 'ETHEREUM',
                      explorer: {
                        name: 'Etherscan',
                        url: 'https://etherscan.io',
                        txUrlFormat: 'https://etherscan.io/tx/{HASH}',
                      },
                    },
                    quantity: 1.5,
                    value: {
                      value: 3000,
                      currency: 'USD',
                    },
                  },
                  {
                    metadata: {
                      evmChainId: '137',
                      internalId: 'POLYGON',
                      explorer: {
                        name: 'Polygonscan',
                        url: 'https://polygonscan.com',
                        txUrlFormat: 'https://polygonscan.com/tx/{HASH}',
                      },
                    },
                    quantity: 0.5,
                    value: {
                      value: 1000,
                      currency: 'USD',
                    },
                  },
                ],
              },
            ],
            networks: [
              {
                metadata: {
                  evmChainId: '1',
                  internalId: 'ETHEREUM',
                  explorer: {
                    name: 'Etherscan',
                    url: 'https://etherscan.io',
                    txUrlFormat: 'https://etherscan.io/tx/{HASH}',
                  },
                },
                value: {
                  value: 3000,
                  currency: 'USD',
                },
                assets: [
                  {
                    metadata: {
                      symbol: 'ETH',
                      name: 'Ethereum',
                    },
                    quantity: 1.5,
                    value: {
                      value: 3000,
                      currency: 'USD',
                    },
                  },
                ],
              },
            ],
          },
        ],
        formattedValue: '$4000.00',
        value: {
          value: 4000,
          currency: 'USD',
        },
      };

      mockUseProfileBalance.mockReturnValue({
        data: singleAssetBalance,
        isLoading: false,
        isSuccess: true,
      });

      const { result } = renderHook(() => useSend(), { wrapper });

      expect(result.current.optionsType).toBe('SINGLE_ASSET');
    });

    it('should return SINGLE_NETWORK when wallet has one asset with one network', async () => {
      const singleNetworkBalance: ProfileBalance = {
        wallets: [
          {
            type: 'EVM',
            address: TEST_WALLET_ADDRESS,
            formattedValue: '$0.00',
            assets: [
              {
                metadata: {
                  symbol: 'ETH',
                  name: 'Ethereum',
                  price: {
                    value: 2000,
                    currency: 'USD',
                  },
                },
                quantity: 1.5,
                networks: [
                  {
                    metadata: {
                      evmChainId: '1',
                      internalId: 'ETHEREUM',
                      explorer: {
                        name: 'Etherscan',
                        url: 'https://etherscan.io',
                        txUrlFormat: 'https://etherscan.io/tx/{HASH}',
                      },
                    },
                    quantity: 1.5,
                    value: {
                      value: 3000,
                      currency: 'USD',
                    },
                  },
                ],
                value: {
                  value: 3000,
                  currency: 'USD',
                },
              },
            ],
            networks: [
              {
                metadata: {
                  evmChainId: '1',
                  internalId: 'ETHEREUM',
                },
                value: {
                  value: 3000,
                  currency: 'USD',
                },
                assets: [
                  {
                    metadata: {
                      symbol: 'ETH',
                      name: 'Ethereum',
                    },
                    quantity: 1.5,
                    value: {
                      value: 3000,
                      currency: 'USD',
                    },
                  },
                ],
              },
            ],
          },
        ],
        formattedValue: '$3000.00',
        value: {
          value: 3000,
          currency: 'USD',
        },
      };

      mockUseProfileBalance.mockReturnValue({
        data: singleNetworkBalance,
        isLoading: false,
        isSuccess: true,
      });

      const { result } = renderHook(() => useSend(), { wrapper });

      expect(result.current.optionsType).toBe('SINGLE_NETWORK');
    });

    it('should return NONE when wallet has no assets', async () => {
      const noAssetsBalance: ProfileBalance = {
        wallets: [
          {
            type: 'EVM',
            formattedValue: '$0.00',
            address: TEST_WALLET_ADDRESS,
            assets: [],
            networks: [],
          },
        ],
        formattedValue: '$0.00',
        value: {
          value: 0,
          currency: 'USD',
        },
      };

      mockUseProfileBalance.mockReturnValue({
        data: noAssetsBalance,
        isLoading: false,
        isSuccess: true,
      });

      const { result } = renderHook(() => useSend(), { wrapper });

      await waitFor(() => {
        expect(result.current.optionsType).toBe('NONE');
      });
    });
  });

  describe('state management', () => {
    it('should update destinationAddress', () => {
      const { result } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setDestinationAddress('0x1234567890123456789012345678901234567890');
      });

      expect(result.current.destinationAddress).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should update transferValue', () => {
      const { result } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setTransferValue(100);
      });

      expect(result.current.transferValue).toBe(100);
    });

    it('should update transferAmount', () => {
      const { result } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setTransferAmount(0.05);
      });

      expect(result.current.transferAmount).toBe(0.05);
    });

    it('should update isMax', () => {
      const { result } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setIsMax(true);
      });

      expect(result.current.isMax).toBe(true);
    });

    it('should update sendMetadata', () => {
      const { result } = renderHook(() => useSend(), { wrapper });

      const newAsset = mockProfileBalance.wallets[0].assets[1]; // USDC
      const newNetwork = newAsset.networks[0];

      act(() => {
        result.current.setSendMetadata({
          asset: newAsset,
          network: newNetwork,
        });
      });

      expect(result.current.sendMetadata.asset?.metadata?.symbol).toBe('USDC');
      expect(result.current.sendMetadata.network).toEqual(newNetwork);
    });
  });

  describe('transfer value and amount synchronization', () => {
    it('should update transferAmount when transferValue changes', async () => {
      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      await waitFor(() => {
        expect(result.current.sendMetadata.asset).toBeTruthy();
      });

      act(() => {
        result.current.setTransferValue(2000); // $2000
      });

      await waitFor(() => {
        // With ETH price of $2000, $2000 should be 1 ETH
        expect(result.current.transferAmount).toBeCloseTo(1, 5);
      });
    });

    it('should update transferValue when transferAmount changes', async () => {
      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      await waitFor(() => {
        expect(result.current.sendMetadata.asset).toBeTruthy();
      });

      act(() => {
        result.current.setTransferAmount(0.5); // 0.5 ETH
      });

      await waitFor(() => {
        // With ETH price of $2000, 0.5 ETH should be $1000
        expect(result.current.transferValue).toBeCloseTo(1000, 5);
      });
    });

    it('should not update transferAmount when transferValue changes if updateSource is amount', async () => {
      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      await waitFor(() => {
        expect(result.current.sendMetadata.asset).toBeTruthy();
      });

      // Set transferAmount first
      act(() => {
        result.current.setTransferAmount(1);
      });

      await waitFor(() => {
        expect(result.current.transferValue).toBeCloseTo(2000, 5);
      });

      // Now change transferValue - it should update transferAmount
      act(() => {
        result.current.setTransferValue(4000);
      });

      await waitFor(() => {
        expect(result.current.transferAmount).toBeCloseTo(2, 5);
      });
    });
  });

  describe('asset calculations', () => {
    it('should calculate assetPrice from sendMetadata', () => {
      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      expect(result.current.assetPrice).toBeTruthy();
      expect(result.current.assetPrice?.value).toBe(2000);
      expect(result.current.assetPrice?.currency).toBe('USD');
    });

    it('should calculate assetValueOnNetwork from sendMetadata', () => {
      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      expect(result.current.assetValueOnNetwork).toBeTruthy();
      expect(result.current.assetValueOnNetwork?.value).toBe(3000);
      expect(result.current.assetValueOnNetwork?.currency).toBe('USD');
    });

    it('should calculate assetAmountOnNetwork from sendMetadata', () => {
      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      expect(result.current.assetAmountOnNetwork).toBe(1.5);
    });

    it('should return null for assetPrice when asset has no price', () => {
      const noPriceBalance: ProfileBalance = {
        wallets: [
          {
            type: 'EVM',
            formattedValue: '$0.00',
            address: TEST_WALLET_ADDRESS,
            assets: [
              {
                metadata: {
                  symbol: 'ETH',
                  name: 'Ethereum',
                },
                quantity: 1.5,
                networks: [
                  {
                    metadata: {
                      evmChainId: '1',
                      internalId: 'ETHEREUM',
                      explorer: {
                        name: 'Etherscan',
                        url: 'https://etherscan.io',
                        txUrlFormat: 'https://etherscan.io/tx/{HASH}',
                      },
                    },
                    quantity: 1.5,
                  },
                ],
              },
            ],
            networks: [
              {
                metadata: {
                  evmChainId: '1',
                  internalId: 'ETHEREUM',
                  explorer: {
                    name: 'Etherscan',
                    url: 'https://etherscan.io',
                    txUrlFormat: 'https://etherscan.io/tx/{HASH}',
                  },
                },
                value: {
                  value: 3000,
                  currency: 'USD',
                },
                assets: [
                  {
                    metadata: {
                      symbol: 'ETH',
                      name: 'Ethereum',
                    },
                    quantity: 1.5,
                    value: {
                      value: 3000,
                      currency: 'USD',
                    },
                  },
                ],
              },
            ],
          },
        ],
        formattedValue: '$0.00',
        value: {
          value: 0,
          currency: 'USD',
        },
      };

      mockUseProfileBalance.mockReturnValue({
        data: noPriceBalance,
        isLoading: false,
        isSuccess: true,
      });

      const { result } = renderHook(() => useSend(), { wrapper });

      expect(result.current.assetPrice).toBeNull();
      expect(result.current.assetValueOnNetwork).toBeNull();
    });
  });

  describe('estimate transaction', () => {
    it('should call estimateSendTransaction when destinationAddress and transferAmount are set', async () => {
      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setDestinationAddress('0x1234567890123456789012345678901234567890');
        result.current.setTransferAmount(0.1);
      });

      await waitFor(() => {
        expect(mockEstimateSendTransaction).toHaveBeenCalled();
      });

      expect(mockEstimateSendTransaction).toHaveBeenCalledWith({
        userId: TEST_USER_ID,
        walletId: TEST_WALLET.id,
        opts: expect.objectContaining({
          type: 'EVM',
          sourceAddress: TEST_WALLET.address,
          destinationAddress: '0x1234567890123456789012345678901234567890',
          transferAmount: 0.1,
        }),
      });
    });

    it('should not call estimateSendTransaction when destinationAddress is empty', async () => {
      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setTransferAmount(0.1);
      });

      // Wait a bit to ensure estimate is not called
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockEstimateSendTransaction).not.toHaveBeenCalled();
    });

    it('should not call estimateSendTransaction when transferAmount is 0 and isMax is false', async () => {
      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setDestinationAddress('0x1234567890123456789012345678901234567890');
        result.current.setTransferAmount(0);
      });

      // Wait a bit to ensure estimate is not called
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockEstimateSendTransaction).not.toHaveBeenCalled();
    });

    it('should use assetAmountOnNetwork when isMax is true', async () => {
      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setDestinationAddress('0x1234567890123456789012345678901234567890');
        result.current.setIsMax(true);
      });

      await waitFor(() => {
        expect(mockEstimateSendTransaction).toHaveBeenCalled();
      });

      expect(mockEstimateSendTransaction).toHaveBeenCalledWith({
        userId: TEST_USER_ID,
        walletId: TEST_WALLET.id,
        opts: expect.objectContaining({
          transferAmount: 1.5, // assetAmountOnNetwork
        }),
      });
    });

    it('should clear estimate when destinationAddress is cleared', async () => {
      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setDestinationAddress('0x1234567890123456789012345678901234567890');
        result.current.setTransferAmount(0.1);
      });

      await waitFor(() => {
        expect(result.current.estimate).toBeTruthy();
      });

      act(() => {
        result.current.setDestinationAddress('');
      });

      await waitFor(() => {
        expect(result.current.estimate).toBeNull();
      });
    });
  });

  describe('reset state on wallet change', () => {
    it('should reset state when wallet address changes', async () => {
      // Balances and selectedWallet are available on load
      const { result, rerender } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setDestinationAddress('0x1234567890123456789012345678901234567890');
        result.current.setTransferValue(100);
        result.current.setTransferAmount(0.05);
        result.current.setIsMax(true);
      });

      // Mock wallet change
      mockUseWalletState.mockReturnValue({
        selectedWallet: {
          id: TEST_WALLET.id,
          address: '0xNEWADDRESS123456789012345678901234567890',
          type: TEST_WALLET.type,
        },
        setSelectedWallet: mockSetSelectedWallet,
      });

      rerender();

      await waitFor(() => {
        expect(result.current.destinationAddress).toBe('');
        expect(result.current.transferValue).toBe(0);
        expect(result.current.transferAmount).toBe(0);
        expect(result.current.isMax).toBe(false);
        expect(result.current.estimate).toBeNull();
      });
    });
  });

  describe('reset state on sendMetadata change', () => {
    it('should reset state when sendMetadata changes (not due to wallet change)', async () => {
      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setDestinationAddress('0x1234567890123456789012345678901234567890');
        result.current.setTransferValue(100);
        result.current.setTransferAmount(0.05);
      });

      const newAsset = mockProfileBalance.wallets[0].assets[1]; // USDC
      const newNetwork = newAsset.networks[0];

      act(() => {
        result.current.setSendMetadata({
          asset: newAsset,
          network: newNetwork,
        });
      });

      await waitFor(() => {
        expect(result.current.destinationAddress).toBe('');
        expect(result.current.transferValue).toBe(0);
        expect(result.current.transferAmount).toBe(0);
        expect(result.current.isMax).toBe(false);
        expect(result.current.estimate).toBeNull();
      });
    });
  });

  describe('onSubmit', () => {
    it('should call broadcastSendTransaction with correct params for EVM', async () => {
      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setDestinationAddress('0x1234567890123456789012345678901234567890');
        result.current.setTransferAmount(0.1);
      });

      await waitFor(() => {
        expect(result.current.estimate).toBeTruthy();
      });

      act(() => {
        result.current.onSubmit();
      });

      await waitFor(() => {
        expect(mockSignTransactionAsync).toHaveBeenCalled();
        expect(mockBroadcastSendTransaction).toHaveBeenCalled();
      });

      expect(mockBroadcastSendTransaction).toHaveBeenCalledWith({
        userId: TEST_USER_ID,
        walletId: TEST_WALLET.id,
        opts: expect.objectContaining({
          type: 'EVM',
          tx: '0x1234567890abcdef',
          sourceAddress: TEST_WALLET.address,
        }),
      });
    });

    it('should call broadcastSendTransaction with correct params for SOLANA', async () => {
      availableWalletsSpy.mockReturnValue([{ ...TEST_WALLET, type: 'SOLANA' } as any]);
      const solanaBalance: ProfileBalance = {
        wallets: [
          {
            address: TEST_WALLET.address!,
            type: 'SOLANA',
            formattedValue: '$1000.00',
            networks: [
              {
                metadata: {
                  internalId: 'SOLANA',
                  explorer: { name: 'Solscan', url: 'https://solscan.io', txUrlFormat: 'https://solscan.io/tx/{HASH}' },
                },
                value: {
                  value: 1000,
                  currency: 'USD',
                },
                assets: [
                  {
                    metadata: {
                      symbol: 'SOL',
                      name: 'Solana',
                    },
                    quantity: 10,
                    value: {
                      value: 1000,
                      currency: 'USD',
                    },
                  },
                ],
              },
            ],
            assets: [
              {
                metadata: {
                  symbol: 'SOL',
                  name: 'Solana',
                  price: {
                    value: 100,
                    currency: 'USD',
                  },
                },
                quantity: 10,
                networks: [
                  {
                    metadata: {
                      internalId: 'SOLANA',
                      explorer: { name: 'Solscan', url: 'https://solscan.io', txUrlFormat: 'https://solscan.io/tx/{HASH}' },
                    },
                    quantity: 10,
                    value: {
                      value: 1000,
                      currency: 'USD',
                    },
                  },
                ],
              },
            ],
          },
        ],
        formattedValue: '$1000.00',
        value: {
          value: 1000,
          currency: 'USD',
        },
      };

      const solanaEstimate: EstimateTransactionResult = {
        result: {
          txSerialized: 'solana-tx-serialized',
          message: 'base64-message',
        },
        feeAmount: '0.000005 SOL',
        feeValue: '$0.000005',
        transferAmount: '1.0 SOL',
        transferValue: '$1.00',
        error: null,
      };

      mockEstimateSendTransaction.mockResolvedValue(solanaEstimate);

      mockUseProfileBalance.mockReturnValue({
        data: solanaBalance,
        isLoading: false,
        isSuccess: true,
      });

      mockUseWalletState.mockReturnValue({
        selectedWallet: {
          id: TEST_WALLET.id,
          address: TEST_WALLET_ADDRESS,
          type: 'SOLANA',
        },
        setSelectedWallet: mockSetSelectedWallet,
      });

      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setDestinationAddress('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');
        result.current.setTransferAmount(1);
      });

      await waitFor(() => {
        expect(result.current.estimate).toBeTruthy();
      });

      act(() => {
        result.current.onSubmit();
      });

      await waitFor(() => {
        expect(mockSignMessageAsync).toHaveBeenCalled();
        expect(mockBroadcastSendTransaction).toHaveBeenCalled();
      });

      expect(mockSignMessageAsync).toHaveBeenCalledWith({
        walletId: TEST_WALLET.id,
        messageBase64: 'base64-message',
      });

      expect(mockBroadcastSendTransaction).toHaveBeenCalledWith({
        userId: TEST_USER_ID,
        walletId: TEST_WALLET.id,
        opts: expect.objectContaining({
          type: 'SOLANA',
          tx: 'solana-tx-serialized',
          sourceAddress: TEST_WALLET.address,
        }),
      });
    });

    it('should set sendTx and navigate to ACCOUNT_MAIN on successful broadcast', async () => {
      mockBroadcastSendTransaction.mockResolvedValue({ error: null });

      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setDestinationAddress('0x1234567890123456789012345678901234567890');
        result.current.setTransferAmount(0.1);
      });

      await waitFor(() => {
        expect(result.current.estimate).toBeTruthy();
      });

      act(() => {
        result.current.onSubmit();
      });

      await waitFor(() => {
        expect(mockSetSendTx).toHaveBeenCalled();
        expect(mockSetStep).toHaveBeenCalledWith('ACCOUNT_MAIN');
      });
    });

    it('should set broadcast error when broadcast returns error', async () => {
      const broadcastError = { error: 'Transaction failed' };
      mockBroadcastSendTransaction.mockResolvedValue(broadcastError);

      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setDestinationAddress('0x1234567890123456789012345678901234567890');
        result.current.setTransferAmount(0.1);
      });

      await waitFor(() => {
        expect(result.current.estimate).toBeTruthy();
      });

      act(() => {
        result.current.onSubmit();
      });

      await waitFor(() => {
        expect(result.current.broadcast).toEqual(broadcastError);
        expect(mockSetSendTx).not.toHaveBeenCalled();
        expect(mockSetStep).not.toHaveBeenCalled();
      });
    });
  });

  describe('isMax handling', () => {
    it('should set isMax to false when transferAmount changes from user input', async () => {
      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setIsMax(true);
      });

      expect(result.current.isMax).toBe(true);

      act(() => {
        result.current.setTransferAmount(0.5);
      });

      await waitFor(() => {
        expect(result.current.isMax).toBe(false);
      });
    });

    it('should not set isMax to false when transferAmount equals assetAmountOnNetwork', async () => {
      // Balances and selectedWallet are available on load
      const { result } = renderHook(() => useSend(), { wrapper });

      act(() => {
        result.current.setIsMax(true);
        result.current.setTransferAmount(1.5); // assetAmountOnNetwork
      });

      // Wait a bit to ensure isMax doesn't change
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current.isMax).toBe(true);
    });
  });

  describe('step handling', () => {
    it('should set default network when step is SEND_FORM and network is null', async () => {
      const { result } = renderHook(() => useSend(), { wrapper });

      await waitFor(() => {
        expect(result.current.sendMetadata.asset).toBeTruthy();
      });

      // Set network to null
      act(() => {
        result.current.setSendMetadata({
          asset: result.current.sendMetadata.asset,
          network: null,
        });
      });

      // The effect should set the first network
      await waitFor(() => {
        expect(result.current.sendMetadata.network).toBeTruthy();
      });
    });
  });
});
