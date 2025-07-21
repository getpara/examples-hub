import { expect, describe, it, vi, beforeEach } from 'vitest';
import { offRampSend } from '../../src/utils/offrampSend.js';
import { OnRampProvider, OnRampPurchase, SuccessfulSignatureRes } from '@getpara/core-sdk';
import { OfframpDepositRequest } from '../../src/types/index.js';

vi.mock('@getpara/core-sdk', async importOriginal => ({
  ...(await importOriginal()),
  hexStringToBase64: vi.fn(),
}));

describe('offRampSend', () => {
  let mockPara: any;
  let mockOnRampPurchase: Partial<OnRampPurchase>;
  let mockDepositRequest: OfframpDepositRequest;

  const mockTxHash = 'tx-hash-123';
  const mockUpdatedOnRampPurchase = {
    id: 'purchase-123',
    fiat: 'USD',
    fiatQuantity: '100',
    assetQuantity: '0.1',
    network: 'ETHEREUM',
    asset: 'ETH',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockPara = {
      getUserId: vi.fn().mockReturnValue('user-123'),
      signTransaction: vi.fn(),
      signMessage: vi.fn(),
      ctx: {
        client: {
          generateOffRampTx: vi.fn(),
          sendOffRampTx: vi.fn(),
          updateOnRampPurchase: vi.fn(),
        },
      },
    };

    mockOnRampPurchase = {
      id: 'purchase-123',
      provider: OnRampProvider.MOONPAY,
      walletId: 'wallet-123',
      walletType: 'EVM',
      address: '0x1234567890123456789012345678901234567890',
      testMode: false,
    };

    mockDepositRequest = {
      assetQuantity: '0.1',
      fiat: 'USD',
      fiatQuantity: '100',
      chainId: '1',
      destinationAddress: '0x0987654321098765432109876543210987654321',
      contractAddress: '0x1111111111111111111111111111111111111111',
    };
  });

  describe('successful transactions', () => {
    it('should handle EVM wallet type successfully', async () => {
      const { hexStringToBase64 } = await import('@getpara/core-sdk');
      const mockTx = '0xabcd1234';
      const mockMessage = 'message';
      const mockNetwork = 'ethereum';
      const mockAsset = 'ETH';
      const mockSignature = 'signature-123';
      const mockBase64Tx = 'base64-tx';

      (hexStringToBase64 as any).mockReturnValue(mockBase64Tx);

      mockPara.ctx.client.generateOffRampTx.mockResolvedValue({
        tx: mockTx,
        message: mockMessage,
        network: mockNetwork,
        asset: mockAsset,
      });

      mockPara.signTransaction.mockResolvedValue({
        signature: mockSignature,
      } as SuccessfulSignatureRes);

      mockPara.ctx.client.sendOffRampTx.mockResolvedValue({
        txHash: mockTxHash,
      });

      mockPara.ctx.client.updateOnRampPurchase.mockResolvedValue(mockUpdatedOnRampPurchase);

      const result = await offRampSend(mockPara, mockOnRampPurchase, mockDepositRequest);

      expect(mockPara.ctx.client.generateOffRampTx).toHaveBeenCalledWith('user-123', {
        walletId: 'wallet-123',
        walletType: 'EVM',
        destinationAddress: '0x0987654321098765432109876543210987654321',
        sourceAddress: '0x1234567890123456789012345678901234567890',
        contractAddress: '0x1111111111111111111111111111111111111111',
        testMode: false,
        assetQuantity: '0.1',
        chainId: '1',
        provider: OnRampProvider.MOONPAY,
      });

      expect(hexStringToBase64).toHaveBeenCalledWith(mockTx);
      expect(mockPara.signTransaction).toHaveBeenCalledWith({
        walletId: 'wallet-123',
        rlpEncodedTxBase64: mockBase64Tx,
        chainId: '1',
      });

      expect(mockPara.ctx.client.sendOffRampTx).toHaveBeenCalledWith('user-123', {
        tx: mockTx,
        signature: `0x${mockSignature}`,
        sourceAddress: '0x1234567890123456789012345678901234567890',
        network: mockNetwork,
        walletId: 'wallet-123',
        walletType: 'EVM',
      });

      expect(mockPara.ctx.client.updateOnRampPurchase).toHaveBeenCalledWith({
        userId: 'user-123',
        walletId: 'wallet-123',
        purchaseId: 'purchase-123',
        updates: {
          fiat: 'USD',
          fiatQuantity: '100',
          assetQuantity: '0.1',
          network: mockNetwork,
          asset: mockAsset,
        },
      });

      expect(result).toEqual({
        txHash: mockTxHash,
        updatedOnRampPurchase: mockUpdatedOnRampPurchase,
      });
    });

    it('should handle SOLANA wallet type successfully', async () => {
      const mockTx = 'solana-tx-123';
      const mockMessage = 'solana-message';
      const mockNetwork = 'solana';
      const mockAsset = 'SOL';
      const mockSignature = 'solana-signature-123';

      mockOnRampPurchase.walletType = 'SOLANA';

      mockPara.ctx.client.generateOffRampTx.mockResolvedValue({
        tx: mockTx,
        message: mockMessage,
        network: mockNetwork,
        asset: mockAsset,
      });

      mockPara.signMessage.mockResolvedValue({
        signature: mockSignature,
      } as SuccessfulSignatureRes);

      mockPara.ctx.client.sendOffRampTx.mockResolvedValue({
        txHash: mockTxHash,
      });

      mockPara.ctx.client.updateOnRampPurchase.mockResolvedValue(mockUpdatedOnRampPurchase);

      const result = await offRampSend(mockPara, mockOnRampPurchase, mockDepositRequest);

      expect(mockPara.signMessage).toHaveBeenCalledWith({
        walletId: 'wallet-123',
        messageBase64: mockMessage,
      });

      expect(mockPara.ctx.client.sendOffRampTx).toHaveBeenCalledWith('user-123', {
        tx: mockTx,
        signature: mockSignature, // No '0x' prefix for SOLANA
        sourceAddress: '0x1234567890123456789012345678901234567890',
        network: mockNetwork,
        walletId: 'wallet-123',
        walletType: 'SOLANA',
      });

      expect(result).toEqual({
        txHash: mockTxHash,
        updatedOnRampPurchase: mockUpdatedOnRampPurchase,
      });
    });

    it('should handle testMode=true correctly', async () => {
      mockOnRampPurchase.testMode = true;

      const mockTx = '0xabcd1234';
      const mockMessage = 'message';
      const mockNetwork = 'ethereum';
      const mockAsset = 'ETH';

      mockPara.ctx.client.generateOffRampTx.mockResolvedValue({
        tx: mockTx,
        message: mockMessage,
        network: mockNetwork,
        asset: mockAsset,
      });

      mockPara.signTransaction.mockResolvedValue({
        signature: 'signature-123',
      } as SuccessfulSignatureRes);

      mockPara.ctx.client.sendOffRampTx.mockResolvedValue({
        txHash: mockTxHash,
      });

      mockPara.ctx.client.updateOnRampPurchase.mockResolvedValue(mockUpdatedOnRampPurchase);

      await offRampSend(mockPara, mockOnRampPurchase, mockDepositRequest);

      expect(mockPara.ctx.client.generateOffRampTx).toHaveBeenCalledWith('user-123', {
        walletId: 'wallet-123',
        walletType: 'EVM',
        destinationAddress: '0x0987654321098765432109876543210987654321',
        sourceAddress: '0x1234567890123456789012345678901234567890',
        contractAddress: '0x1111111111111111111111111111111111111111',
        assetQuantity: '0.1',
        chainId: '1',
        provider: OnRampProvider.MOONPAY,
        testMode: true,
      });
    });
  });

  describe('validation errors', () => {
    it('should throw error when purchaseId is missing', async () => {
      mockOnRampPurchase.id = undefined;

      await expect(offRampSend(mockPara, mockOnRampPurchase, mockDepositRequest)).rejects.toThrow('Missing required fields');
    });

    it('should throw error when walletId is missing', async () => {
      mockOnRampPurchase.walletId = undefined;

      await expect(offRampSend(mockPara, mockOnRampPurchase, mockDepositRequest)).rejects.toThrow('Missing required fields');
    });

    it('should throw error when walletType is missing', async () => {
      mockOnRampPurchase.walletType = undefined;

      await expect(offRampSend(mockPara, mockOnRampPurchase, mockDepositRequest)).rejects.toThrow('Missing required fields');
    });

    it('should throw error when provider is missing', async () => {
      mockOnRampPurchase.provider = undefined;

      await expect(offRampSend(mockPara, mockOnRampPurchase, mockDepositRequest)).rejects.toThrow('Missing required fields');
    });

    it('should throw error for unsupported wallet type', async () => {
      mockOnRampPurchase.walletType = 'UNSUPPORTED' as any;

      mockPara.ctx.client.generateOffRampTx.mockResolvedValue({
        tx: '0xabcd1234',
        message: 'message',
        network: 'ethereum',
        asset: 'ETH',
      });

      await expect(offRampSend(mockPara, mockOnRampPurchase, mockDepositRequest)).rejects.toThrow(
        'Unsupported wallet type: UNSUPPORTED',
      );
    });
  });

  describe('error handling', () => {
    it('should handle generateOffRampTx errors', async () => {
      const errorMessage = 'Failed to generate transaction';
      mockPara.ctx.client.generateOffRampTx.mockRejectedValue(new Error(errorMessage));

      await expect(offRampSend(mockPara, mockOnRampPurchase, mockDepositRequest)).rejects.toThrow(errorMessage);
    });

    it('should handle signTransaction errors for EVM', async () => {
      const errorMessage = 'Failed to sign transaction';

      mockPara.ctx.client.generateOffRampTx.mockResolvedValue({
        tx: '0xabcd1234',
        message: 'message',
        network: 'ethereum',
        asset: 'ETH',
      });

      mockPara.signTransaction.mockRejectedValue(new Error(errorMessage));

      await expect(offRampSend(mockPara, mockOnRampPurchase, mockDepositRequest)).rejects.toThrow(errorMessage);
    });

    it('should handle signMessage errors for SOLANA', async () => {
      const errorMessage = 'Failed to sign message';
      mockOnRampPurchase.walletType = 'SOLANA';

      mockPara.ctx.client.generateOffRampTx.mockResolvedValue({
        tx: 'solana-tx-123',
        message: 'solana-message',
        network: 'solana',
        asset: 'SOL',
      });

      mockPara.signMessage.mockRejectedValue(new Error(errorMessage));

      await expect(offRampSend(mockPara, mockOnRampPurchase, mockDepositRequest)).rejects.toThrow(errorMessage);
    });

    it('should handle sendOffRampTx errors', async () => {
      const errorMessage = 'Failed to send transaction';

      mockPara.ctx.client.generateOffRampTx.mockResolvedValue({
        tx: '0xabcd1234',
        message: 'message',
        network: 'ethereum',
        asset: 'ETH',
      });

      mockPara.signTransaction.mockResolvedValue({
        signature: 'signature-123',
      } as SuccessfulSignatureRes);

      mockPara.ctx.client.sendOffRampTx.mockRejectedValue(new Error(errorMessage));

      await expect(offRampSend(mockPara, mockOnRampPurchase, mockDepositRequest)).rejects.toThrow(errorMessage);
    });

    it('should handle updateOnRampPurchase errors', async () => {
      const errorMessage = 'Failed to update purchase';

      mockPara.ctx.client.generateOffRampTx.mockResolvedValue({
        tx: '0xabcd1234',
        message: 'message',
        network: 'ethereum',
        asset: 'ETH',
      });

      mockPara.signTransaction.mockResolvedValue({
        signature: 'signature-123',
      } as SuccessfulSignatureRes);

      mockPara.ctx.client.sendOffRampTx.mockResolvedValue({
        txHash: mockTxHash,
      });

      mockPara.ctx.client.updateOnRampPurchase.mockRejectedValue(new Error(errorMessage));

      await expect(offRampSend(mockPara, mockOnRampPurchase, mockDepositRequest)).rejects.toThrow(errorMessage);
    });

    it('should handle errors with response.data', async () => {
      const errorData = 'Detailed error from API';
      const error = {
        message: 'Generic error',
        response: {
          data: errorData,
        },
      };

      mockPara.ctx.client.generateOffRampTx.mockRejectedValue(error);

      await expect(offRampSend(mockPara, mockOnRampPurchase, mockDepositRequest)).rejects.toThrow(errorData);
    });

    it('should handle errors without response.data', async () => {
      const errorMessage = 'Generic error message';
      const error = {
        message: errorMessage,
      };

      mockPara.ctx.client.generateOffRampTx.mockRejectedValue(error);

      await expect(offRampSend(mockPara, mockOnRampPurchase, mockDepositRequest)).rejects.toThrow(errorMessage);
    });
  });

  describe('edge cases', () => {
    it('should handle missing testMode (defaults to false)', async () => {
      const onRampPurchaseWithoutTestMode = {
        ...mockOnRampPurchase,
        testMode: undefined,
      };

      const mockTx = '0xabcd1234';
      const mockMessage = 'message';
      const mockNetwork = 'ethereum';
      const mockAsset = 'ETH';

      mockPara.ctx.client.generateOffRampTx.mockResolvedValue({
        tx: mockTx,
        message: mockMessage,
        network: mockNetwork,
        asset: mockAsset,
      });

      mockPara.signTransaction.mockResolvedValue({
        signature: 'signature-123',
      } as SuccessfulSignatureRes);

      mockPara.ctx.client.sendOffRampTx.mockResolvedValue({
        txHash: mockTxHash,
      });

      mockPara.ctx.client.updateOnRampPurchase.mockResolvedValue(mockUpdatedOnRampPurchase);

      await offRampSend(mockPara, onRampPurchaseWithoutTestMode, mockDepositRequest);

      expect(mockPara.ctx.client.generateOffRampTx).toHaveBeenCalledWith('user-123', {
        walletId: 'wallet-123',
        walletType: 'EVM',
        provider: OnRampProvider.MOONPAY,
        chainId: '1',
        destinationAddress: '0x0987654321098765432109876543210987654321',
        sourceAddress: '0x1234567890123456789012345678901234567890',
        contractAddress: '0x1111111111111111111111111111111111111111',
        testMode: false,
        assetQuantity: '0.1',
      });
    });

    it('should handle empty signature from signTransaction', async () => {
      mockPara.ctx.client.generateOffRampTx.mockResolvedValue({
        tx: '0xabcd1234',
        message: 'message',
        network: 'ethereum',
        asset: 'ETH',
      });

      mockPara.signTransaction.mockResolvedValue({
        signature: '',
      } as SuccessfulSignatureRes);

      mockPara.ctx.client.sendOffRampTx.mockResolvedValue({
        txHash: mockTxHash,
      });

      mockPara.ctx.client.updateOnRampPurchase.mockResolvedValue(mockUpdatedOnRampPurchase);

      await offRampSend(mockPara, mockOnRampPurchase, mockDepositRequest);

      expect(mockPara.ctx.client.sendOffRampTx).toHaveBeenCalledWith('user-123', {
        tx: '0xabcd1234',
        signature: '0x', // Empty signature with 0x prefix
        sourceAddress: '0x1234567890123456789012345678901234567890',
        network: 'ethereum',
        walletId: 'wallet-123',
        walletType: 'EVM',
      });
    });
  });
});
