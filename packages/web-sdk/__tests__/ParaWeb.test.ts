import { expect, describe, it, vi, beforeEach } from 'vitest';

import Para, { Environment, offRampSend } from '../src/index.js';

vi.mock('../src/utils/isPasskeySupported.js', () => ({
  isPasskeySupported: vi.fn().mockResolvedValue(true),
}));

vi.mock('../src/utils/offrampSend.js', () => ({
  offRampSend: vi.fn(),
}));

const mocks = vi.hoisted(() => ({
  addEventListener: vi.fn(),
  openPopup: vi.fn(),
  postMessage: vi.fn(),
  close: vi.fn(),
  getOnRampConfig: vi.fn(),
  signMoonPayUrl: vi.fn(),
  getPortalURL: vi.fn(),
  assertUserId: vi.fn(),
  initiateOnRampTransaction: vi.fn(),
  createOnRampPurchase: vi.fn().mockResolvedValue({ id: 'id' }),
  touchSession: vi.fn().mockResolvedValue({ partnerId: 'partnerId' }),
  getPartner: vi.fn().mockResolvedValue({ data: { partner: {} } }),
}));

vi.stubGlobal('window', { addEventListener: mocks.addEventListener });

describe('ParaCore', () => {
  let para: Para;
  const apiKey = 'api-key-123';

  beforeEach(() => {
    vi.clearAllMocks();
    para = new Para(Environment.DEV, apiKey);

    // Mock the platform utils
    (para as any).platformUtils = {
      openPopup: mocks.openPopup,
    };

    // Mock the context client
    (para as any).ctx = {
      ...para.ctx,
      client: {
        getOnRampConfig: mocks.getOnRampConfig,
        signMoonPayUrl: mocks.signMoonPayUrl,
        createOnRampPurchase: mocks.createOnRampPurchase,
        touchSession: mocks.touchSession,
        getPartner: mocks.getPartner,
      },
    };

    // Mock inherited methods
    (para as any).getPortalURL = mocks.getPortalURL;
    (para as any).assertUserId = mocks.assertUserId;
    (para as any).isPortal = vi.fn().mockReturnValue(false);

    // Mock the super class method
    Object.setPrototypeOf(para, {
      ...Object.getPrototypeOf(para),
      initiateOnRampTransaction: mocks.initiateOnRampTransaction,
    });
  });

  describe('constructor', () => {
    describe('creates a new instance of ParaCore with correct fields', () => {
      it('without Farcaster', async () => {
        const apiKey = 'api-key-123';
        const para = new Para(Environment.DEV, apiKey);

        expect(para).toBeInstanceOf(Para);
        expect(para.ctx.env).toBe(Environment.DEV);
        expect(para.ctx.apiKey).toBe(apiKey);
        expect(para.wallets).toEqual({});

        expect(await para.isPasskeySupported()).toBe(true);
        expect(mocks.addEventListener).toBeCalledWith('message', (para as unknown as any).portalEventListener);
      });

      it('with Farcaster', async () => {
        vi.doMock('@farcaster/miniapp-sdk', () => ({
          sdk: {
            isInMiniApp: vi.fn().mockResolvedValue(true),
          },
        }));

        const apiKey = 'api-key-123';
        const para = new Para(Environment.DEV, apiKey);

        await (para as unknown as any).ready();

        expect(para).toBeInstanceOf(Para);
        expect(para.ctx.env).toBe(Environment.DEV);
        expect(para.ctx.apiKey).toBe(apiKey);
        expect(para.wallets).toEqual({});

        expect(para.isReady).toBe(true);
        expect(para.isFarcasterMiniApp).toBe(true);

        expect(await para.isPasskeySupported()).toBe(true);
        expect(mocks.addEventListener).toBeCalledWith('message', (para as unknown as any).portalEventListener);
      });

      it('with Farcaster (error)', async () => {
        vi.doMock('@farcaster/miniapp-sdk', () => ({ sdk: undefined }));

        const apiKey = 'api-key-123';
        const para = new Para(Environment.DEV, apiKey);

        await (para as unknown as any).ready();

        expect(para).toBeInstanceOf(Para);
        expect(para.ctx.env).toBe(Environment.DEV);
        expect(para.ctx.apiKey).toBe(apiKey);
        expect(para.wallets).toEqual({});

        expect(para.isReady).toBe(true);
        expect(para.isFarcasterMiniApp).toBe(false);

        expect(await para.isPasskeySupported()).toBe(true);
        expect(mocks.addEventListener).toBeCalledWith('message', (para as unknown as any).portalEventListener);
      });
    });
  });

  describe('portalEventListener', () => {
    const mockMessagePort = {
      postMessage: mocks.postMessage,
      close: mocks.close,
    };

    beforeEach(() => {
      mocks.getPortalURL.mockResolvedValue('https://portal.example.com');
      mocks.assertUserId.mockReturnValue('user-123');
    });

    it('should ignore events that are not from Para', async () => {
      const event = {
        data: { isPara: false, type: 'ONRAMPS__INIT' },
        origin: 'https://portal.example.com',
        ports: [mockMessagePort],
      } as unknown as MessageEvent;

      await (para as any).portalEventListener(event);

      expect(mocks.postMessage).not.toHaveBeenCalled();
      expect(mocks.close).not.toHaveBeenCalled();
    });

    it('should ignore events from wrong origin', async () => {
      const event = {
        data: { isPara: true, type: 'ONRAMPS__INIT' },
        origin: 'https://malicious.com',
        ports: [mockMessagePort],
      } as unknown as MessageEvent;

      await (para as any).portalEventListener(event);

      expect(mocks.postMessage).not.toHaveBeenCalled();
      expect(mocks.close).not.toHaveBeenCalled();
    });

    it('should ignore events when isPortal returns true', async () => {
      (para as any).isPortal = vi.fn().mockReturnValue(true);

      const event = {
        data: { isPara: true, type: 'ONRAMPS__INIT' },
        origin: 'https://portal.example.com',
        ports: [mockMessagePort],
      } as unknown as MessageEvent;

      await (para as any).portalEventListener(event);

      expect(mocks.postMessage).not.toHaveBeenCalled();
      expect(mocks.close).not.toHaveBeenCalled();
    });

    it('should handle ONRAMPS__INIT event successfully', async () => {
      const mockOnRampConfig = { config: 'test' };
      const mockOnRampPurchase = { walletType: 'test', network: 'test' };

      mocks.getOnRampConfig.mockResolvedValue(mockOnRampConfig);
      (para as any).onRampPopup = { onRampPurchase: mockOnRampPurchase };

      const event = {
        data: { isPara: true, type: 'ONRAMPS__INIT', id: 'test-id' },
        origin: 'https://portal.example.com',
        ports: [mockMessagePort],
      } as unknown as MessageEvent;

      await (para as any).portalEventListener(event);

      expect(mocks.getOnRampConfig).toHaveBeenCalled();
      expect(mocks.postMessage).toHaveBeenCalledWith({
        id: 'test-id',
        type: 'ONRAMPS__INIT',
        isPara: true,
        status: 'SUCCESS',
        payload: {
          onRampPurchase: mockOnRampPurchase,
          onRampConfig: mockOnRampConfig,
        },
      });
      expect(mocks.close).toHaveBeenCalled();
    });

    it('should handle ONRAMPS__SIGN_MOONPAY_URL event successfully', async () => {
      const mockSignature = { signature: 'test-signature' };
      const mockOnRampPurchase = {
        walletType: 'test',
        network: 'cosmos',
        testMode: true,
        walletId: 'wallet-123',
        externalWalletAddress: 'address-123',
      };

      mocks.signMoonPayUrl.mockResolvedValue({ data: mockSignature });
      (para as any).onRampPopup = { onRampPurchase: mockOnRampPurchase };

      const event = {
        data: {
          isPara: true,
          type: 'ONRAMPS__SIGN_MOONPAY_URL',
          id: 'test-id',
          payload: { url: 'https://moonpay.com/test' },
        },
        origin: 'https://portal.example.com',
        ports: [mockMessagePort],
      } as unknown as MessageEvent;

      await (para as any).portalEventListener(event);

      expect(mocks.signMoonPayUrl).toHaveBeenCalledWith('user-123', {
        url: 'https://moonpay.com/test',
        type: 'test',
        testMode: true,
        walletId: 'wallet-123',
        externalWalletAddress: 'address-123',
      });
      expect(mocks.postMessage).toHaveBeenCalledWith({
        id: 'test-id',
        type: 'ONRAMPS__SIGN_MOONPAY_URL',
        isPara: true,
        status: 'SUCCESS',
        payload: mockSignature,
      });
      expect(mocks.close).toHaveBeenCalled();
    });

    it('should handle ONRAMPS__SIGN_DEPOSIT_TX event successfully', async () => {
      const mockDepositRequest = { amount: 100, currency: 'USD' };
      const mockOnRampPurchase = { walletType: 'test', network: 'test' };
      const mockTxHash = 'tx-hash-123';
      const mockUpdatedOnRampPurchase = { ...mockOnRampPurchase, updated: true };

      (offRampSend as any).mockResolvedValue({
        txHash: mockTxHash,
        updatedOnRampPurchase: mockUpdatedOnRampPurchase,
      });
      (para as any).onRampPopup = { onRampPurchase: mockOnRampPurchase };

      const event = {
        data: {
          isPara: true,
          type: 'ONRAMPS__SIGN_DEPOSIT_TX',
          id: 'test-id',
          payload: { depositRequest: mockDepositRequest },
        },
        origin: 'https://portal.example.com',
        ports: [mockMessagePort],
      } as unknown as MessageEvent;

      await (para as any).portalEventListener(event);

      expect(offRampSend).toHaveBeenCalledWith(para, mockOnRampPurchase, mockDepositRequest);
      expect(mocks.postMessage).toHaveBeenCalledWith({
        id: 'test-id',
        type: 'ONRAMPS__SIGN_DEPOSIT_TX',
        isPara: true,
        status: 'SUCCESS',
        payload: {
          onRampPurchase: mockUpdatedOnRampPurchase,
          txHash: mockTxHash,
        },
      });
      expect(mocks.close).toHaveBeenCalled();
    });

    it('should handle errors in event processing', async () => {
      const errorMessage = 'Test error';
      mocks.getOnRampConfig.mockRejectedValue(new Error(errorMessage));

      const event = {
        data: { isPara: true, type: 'ONRAMPS__INIT', id: 'test-id' },
        origin: 'https://portal.example.com',
        ports: [mockMessagePort],
      } as unknown as MessageEvent;

      await (para as any).portalEventListener(event);

      expect(mocks.postMessage).toHaveBeenCalledWith({
        id: 'test-id',
        type: 'ONRAMPS__INIT',
        isPara: true,
        status: 'ERROR',
        payload: { error: errorMessage },
      });
      expect(mocks.close).toHaveBeenCalled();
    });

    it('should handle ONRAMPS__SIGN_DEPOSIT_TX errors', async () => {
      const errorMessage = 'Transaction failed';
      const mockDepositRequest = { amount: 100, currency: 'USD' };
      const mockOnRampPurchase = { walletType: 'test', network: 'test' };

      (offRampSend as any).mockRejectedValue(new Error(errorMessage));
      (para as any).onRampPopup = { onRampPurchase: mockOnRampPurchase };

      const event = {
        data: {
          isPara: true,
          type: 'ONRAMPS__SIGN_DEPOSIT_TX',
          id: 'test-id',
          payload: { depositRequest: mockDepositRequest },
        },
        origin: 'https://portal.example.com',
        ports: [mockMessagePort],
      } as unknown as MessageEvent;

      await (para as any).portalEventListener(event);

      expect(mocks.postMessage).toHaveBeenCalledWith({
        id: 'test-id',
        type: 'ONRAMPS__SIGN_DEPOSIT_TX',
        isPara: true,
        status: 'ERROR',
        payload: { error: errorMessage },
      });
      expect(mocks.close).toHaveBeenCalled();
    });
  });
});
