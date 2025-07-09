import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ParaSolanaSigner } from '../src/solanaSigner';
import { createParaSolanaSigner } from '../src/index';
import { mockPara, mockSignMessage, mockFindWalletId } from './mocks/mockParaCore';
import { mockRpc, createMockTransaction } from './mocks/mockSolana';
import {
  TEST_WALLET_ADDRESS,
  TEST_WALLET_ID,
  TEST_MESSAGE_BYTES,
  NO_PARA_ERROR_MESSAGE,
  ABORT_ERROR_MESSAGE,
} from './constants';

describe('ParaSolanaSigner', () => {
  let signer: ParaSolanaSigner;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFindWalletId.mockReturnValue('mock-wallet-id');
    signer = new ParaSolanaSigner({ para: mockPara, rpc: mockRpc });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create a signer instance with para and rpc', () => {
      expect(signer).toBeInstanceOf(ParaSolanaSigner);
      expect(signer.address).toBe(TEST_WALLET_ADDRESS);
    });

    it('should throw error if para is not provided', () => {
      expect(() => new ParaSolanaSigner({ rpc: mockRpc } as any)).toThrow(NO_PARA_ERROR_MESSAGE);
    });

    it('should throw error if no Solana wallet is found', () => {
      mockFindWalletId.mockImplementationOnce(() => {
        throw new Error('No wallet found');
      });
      expect(() => new ParaSolanaSigner({ para: mockPara, rpc: mockRpc })).toThrow(
        'ParaSolanaSigner: Failed to find Solana wallet',
      );
    });

    it('should use the wallet ID returned by findWalletId', () => {
      mockFindWalletId.mockReturnValueOnce('another-wallet-id');
      const anotherMockPara = {
        ...mockPara,
        wallets: {
          'another-wallet-id': {
            id: 'another-wallet-id',
            address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
            blockchainType: 'SOL',
            signerType: 'SOLANA',
          },
        },
      };

      const customWalletSigner = new ParaSolanaSigner({ para: anotherMockPara, rpc: mockRpc });
      expect(customWalletSigner.address).toBe('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');
    });
  });

  describe('signTransactions', () => {
    it('should sign multiple transactions', async () => {
      const transactions = [createMockTransaction(), createMockTransaction()];
      mockSignMessage.mockResolvedValue({ signature: 'bW9ja1NpZ25hdHVyZQ==', walletId: TEST_WALLET_ID });

      const result = await signer.signTransactions(transactions);

      expect(result).toHaveLength(2);
      expect(mockSignMessage).toHaveBeenCalledTimes(2);
      expect(mockSignMessage).toHaveBeenCalledWith({
        walletId: TEST_WALLET_ID,
        messageBase64: expect.any(String),
      });

      result.forEach(signatureDict => {
        expect(signatureDict).toBeDefined();
        expect(Object.keys(signatureDict)).toContain(TEST_WALLET_ADDRESS);
      });
    });

    it('should handle transactions without serialize method', async () => {
      const transaction = createMockTransaction(false);
      mockSignMessage.mockResolvedValueOnce({ signature: 'bW9ja1NpZ25hdHVyZQ==', walletId: TEST_WALLET_ID });

      const result = await signer.signTransactions([transaction]);

      expect(result).toHaveLength(1);
      expect(mockSignMessage).toHaveBeenCalledWith({
        walletId: TEST_WALLET_ID,
        messageBase64: expect.any(String),
      });
    });

    it('should handle abort signal', async () => {
      const controller = new AbortController();
      const transactions = [createMockTransaction()];

      controller.abort();

      await expect(signer.signTransactions(transactions, { abortSignal: controller.signal })).rejects.toThrow(
        ABORT_ERROR_MESSAGE,
      );
    });

    it('should handle empty transaction array', async () => {
      await expect(signer.signTransactions([])).rejects.toThrow('ParaSolanaSigner: No transactions provided to sign');
      expect(mockSignMessage).not.toHaveBeenCalled();
    });

    it('should handle signing errors', async () => {
      const transactions = [createMockTransaction()];
      const errorMessage = 'Signing failed';
      mockSignMessage.mockRejectedValueOnce(new Error(errorMessage));

      await expect(signer.signTransactions(transactions)).rejects.toThrow('ParaSolanaSigner: Failed to sign transaction 1');
    });

    it('should handle transaction review error', async () => {
      const transactions = [createMockTransaction()];
      const reviewUrl = 'https://example.com/review';
      mockSignMessage.mockResolvedValueOnce({
        transactionReviewUrl: reviewUrl,
      });

      await expect(signer.signTransactions(transactions)).rejects.toThrow('Transaction review required');
    });

    it('should handle transactions with empty messageBytes', async () => {
      const transaction = {
        ...createMockTransaction(),
        messageBytes: new Uint8Array([]),
      };

      await expect(signer.signTransactions([transaction])).rejects.toThrow(
        'ParaSolanaSigner: Transaction 1 has no message bytes to sign',
      );
    });

    it('should handle transactions with missing messageBytes', async () => {
      const transaction = {
        ...createMockTransaction(),
        messageBytes: undefined,
      };

      await expect(signer.signTransactions([transaction])).rejects.toThrow(
        'ParaSolanaSigner: Transaction 1 has no message bytes to sign',
      );
    });
  });

  describe('modifyAndSignTransactions', () => {
    it('should modify and sign transactions', async () => {
      const transactions = [createMockTransaction()];
      mockSignMessage.mockResolvedValueOnce({ signature: 'bW9ja1NpZ25hdHVyZQ==', walletId: TEST_WALLET_ID });

      const result = await signer.modifyAndSignTransactions(transactions);

      expect(result).toHaveLength(1);
      expect(result[0].signatures).toBeDefined();
      expect(result[0].signatures[TEST_WALLET_ADDRESS]).toBeDefined();
    });

    it('should handle abort signal in modify phase', async () => {
      const controller = new AbortController();
      const transactions = [createMockTransaction()];

      controller.abort();

      await expect(signer.modifyAndSignTransactions(transactions, { abortSignal: controller.signal })).rejects.toThrow(
        'ParaSolanaSigner: Operation was aborted before starting',
      );
    });
  });

  describe('signAndSendTransactions', () => {
    it('should sign and send transactions', async () => {
      const transactions = [createMockTransaction()];
      mockSignMessage.mockResolvedValueOnce({ signature: 'bW9ja1NpZ25hdHVyZQ==', walletId: TEST_WALLET_ID });

      // Mock the RPC sendTransaction call
      const mockSendTransaction = vi.fn().mockResolvedValue('mockTransactionSignature');
      const mockRpcWithSend = {
        ...mockRpc,
        sendTransaction: vi.fn().mockReturnValue({
          send: mockSendTransaction,
        }),
      };

      const signerWithMockRpc = new ParaSolanaSigner({ para: mockPara, rpc: mockRpcWithSend });

      const result = await signerWithMockRpc.signAndSendTransactions(transactions);

      expect(result).toHaveLength(1);
      expect(mockSendTransaction).toHaveBeenCalled();
    });

    it('should handle send options', async () => {
      const transactions = [createMockTransaction()];
      mockSignMessage.mockResolvedValueOnce({ signature: 'bW9ja1NpZ25hdHVyZQ==', walletId: TEST_WALLET_ID });

      const mockSendTransaction = vi.fn().mockResolvedValue('mockTransactionSignature');
      const mockRpcWithSend = {
        ...mockRpc,
        sendTransaction: vi.fn().mockReturnValue({
          send: mockSendTransaction,
        }),
      };

      const signerWithMockRpc = new ParaSolanaSigner({ para: mockPara, rpc: mockRpcWithSend });

      await signerWithMockRpc.signAndSendTransactions(transactions);

      expect(mockSendTransaction).toHaveBeenCalled();
    });

    it('should handle send errors', async () => {
      const transactions = [createMockTransaction()];
      mockSignMessage.mockResolvedValueOnce({ signature: 'bW9ja1NpZ25hdHVyZQ==', walletId: TEST_WALLET_ID });

      const sendError = new Error('Network error');
      const mockSendTransaction = vi.fn().mockRejectedValue(sendError);
      const mockRpcWithSend = {
        ...mockRpc,
        sendTransaction: vi.fn().mockReturnValue({
          send: mockSendTransaction,
        }),
      };

      const signerWithMockRpc = new ParaSolanaSigner({ para: mockPara, rpc: mockRpcWithSend });

      await expect(signerWithMockRpc.signAndSendTransactions(transactions)).rejects.toThrow(
        'ParaSolanaSigner: Failed to send transaction 1',
      );
    });

    it('should handle abort signal during send', async () => {
      const controller = new AbortController();
      const transactions = [createMockTransaction()];

      controller.abort();

      await expect(signer.signAndSendTransactions(transactions, { abortSignal: controller.signal })).rejects.toThrow(
        'ParaSolanaSigner: Operation was aborted before starting',
      );
    });
  });

  describe('signMessages', () => {
    it('should sign multiple messages', async () => {
      const messages = [{ content: TEST_MESSAGE_BYTES }, { content: new TextEncoder().encode('Another message') }];
      mockSignMessage.mockResolvedValue({ signature: 'bW9ja1NpZ25hdHVyZQ==', walletId: TEST_WALLET_ID });

      const result = await signer.signMessages(messages);

      expect(result).toHaveLength(2);
      expect(mockSignMessage).toHaveBeenCalledTimes(2);

      result.forEach(signature => {
        expect(signature[TEST_WALLET_ADDRESS]).toBeDefined();
        expect(signature[TEST_WALLET_ADDRESS]).toBeInstanceOf(Buffer);
      });
    });

    it('should handle abort signal', async () => {
      const controller = new AbortController();
      const messages = [{ content: TEST_MESSAGE_BYTES }];

      controller.abort();

      await expect(signer.signMessages(messages, { abortSignal: controller.signal })).rejects.toThrow(
        'ParaSolanaSigner: Operation was aborted before starting',
      );
    });

    it('should handle empty message array', async () => {
      await expect(signer.signMessages([])).rejects.toThrow('ParaSolanaSigner: No messages provided to sign');
      expect(mockSignMessage).not.toHaveBeenCalled();
    });

    it('should properly encode signatures', async () => {
      const messages = [{ content: TEST_MESSAGE_BYTES }];
      const base64Signature = Buffer.from('testSignature123').toString('base64');
      mockSignMessage.mockResolvedValueOnce({
        signature: base64Signature,
        walletId: TEST_WALLET_ID,
      });

      const result = await signer.signMessages(messages);

      expect(result).toHaveLength(1);
      const signatureBytes = result[0][TEST_WALLET_ADDRESS];
      expect(signatureBytes).toEqual(Buffer.from(base64Signature, 'base64'));
    });

    it('should handle message signing errors', async () => {
      const messages = [{ content: TEST_MESSAGE_BYTES }];
      const errorMessage = 'Message signing failed';
      mockSignMessage.mockRejectedValueOnce(new Error(errorMessage));

      await expect(signer.signMessages(messages)).rejects.toThrow('ParaSolanaSigner: Failed to sign message 1');
    });

    it('should handle message review error', async () => {
      const messages = [{ content: TEST_MESSAGE_BYTES }];
      const reviewUrl = 'https://example.com/review';
      mockSignMessage.mockResolvedValueOnce({
        transactionReviewUrl: reviewUrl,
      });

      await expect(signer.signMessages(messages)).rejects.toThrow('Transaction review required');
    });

    it('should handle messages with empty content', async () => {
      const messages = [{ content: new Uint8Array([]) }];

      await expect(signer.signMessages(messages)).rejects.toThrow('ParaSolanaSigner: Message 1 has no content to sign');
    });

    it('should handle messages with missing content', async () => {
      const messages = [{ content: undefined }];

      await expect(signer.signMessages(messages)).rejects.toThrow('ParaSolanaSigner: Message 1 has no content to sign');
    });
  });

  describe('modifyAndSignMessages', () => {
    it('should modify and sign messages', async () => {
      const messages = [{ content: new Uint8Array([1, 2, 3]) }];

      mockSignMessage.mockResolvedValueOnce({ signature: 'bW9ja1NpZ25hdHVyZQ==', walletId: TEST_WALLET_ID });

      const result = await signer.modifyAndSignMessages(messages);

      expect(result).toHaveLength(1);
      expect(result[0].signatures[TEST_WALLET_ADDRESS]).toBeDefined();
    });

    it('should handle abort signal in modify phase', async () => {
      const controller = new AbortController();
      const messages = [{ content: TEST_MESSAGE_BYTES }];

      controller.abort();

      await expect(signer.modifyAndSignMessages(messages, { abortSignal: controller.signal })).rejects.toThrow(
        'ParaSolanaSigner: Operation was aborted before starting',
      );
    });
  });

  describe('createParaSolanaSigner', () => {
    it('should create a signer instance using factory function', () => {
      const factorySigner = createParaSolanaSigner({ para: mockPara, rpc: mockRpc });
      expect(factorySigner).toBeInstanceOf(ParaSolanaSigner);
      expect(factorySigner.address).toBe(TEST_WALLET_ADDRESS);
    });

    it('should pass through constructor errors', () => {
      expect(() => createParaSolanaSigner({ rpc: mockRpc } as any)).toThrow(NO_PARA_ERROR_MESSAGE);
    });
  });
});
