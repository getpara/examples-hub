import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { routeMobileExternalWallet } from '../../../src/modal/utils/routeMobileExternalWallet';

// Mock the utility functions from @getpara/web-sdk
vi.mock('@getpara/web-sdk', () => ({
  isAndroid: vi.fn(),
  isMobile: vi.fn(),
  isTelegram: vi.fn(),
}));

// Import the mocked functions
import { isAndroid, isMobile, isTelegram } from '@getpara/web-sdk';

describe('routeMobileExternalWallet', () => {
  let mockWindow: any;
  let mockDocument: any;
  let mockLink: any;

  beforeEach(() => {
    // Mock window object
    mockWindow = {
      open: vi.fn(),
      location: {
        href: '',
      },
    };

    // Mock link element
    mockLink = {
      href: '',
      target: '',
      rel: '',
      click: vi.fn(),
    };

    // Mock document.createElement
    mockDocument = {
      createElement: vi.fn().mockReturnValue(mockLink),
    };

    // Set up global mocks
    global.window = mockWindow;
    global.document = mockDocument;

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('server-side rendering scenarios', () => {
    it('should return early when window is undefined', () => {
      // @ts-ignore - intentionally setting window to undefined for SSR test
      global.window = undefined;

      routeMobileExternalWallet('https://example.com');

      // Verify no mobile detection functions were called
      expect(isMobile).not.toHaveBeenCalled();
      expect(isTelegram).not.toHaveBeenCalled();
      expect(isAndroid).not.toHaveBeenCalled();
    });
  });

  describe('non-mobile scenarios', () => {
    it('should return early when not on mobile', () => {
      vi.mocked(isMobile).mockReturnValue(false);

      routeMobileExternalWallet('https://example.com');

      expect(isMobile).toHaveBeenCalled();
      expect(isTelegram).not.toHaveBeenCalled();
      expect(isAndroid).not.toHaveBeenCalled();
      expect(mockDocument.createElement).not.toHaveBeenCalled();
      expect(mockWindow.open).not.toHaveBeenCalled();
    });
  });

  describe('mobile scenarios', () => {
    beforeEach(() => {
      vi.mocked(isMobile).mockReturnValue(true);
    });

    it('should return early when on mobile but no qrUri provided', () => {
      routeMobileExternalWallet();

      expect(isMobile).toHaveBeenCalled();
      expect(isTelegram).not.toHaveBeenCalled();
      expect(isAndroid).not.toHaveBeenCalled();
      expect(mockDocument.createElement).not.toHaveBeenCalled();
      expect(mockWindow.open).not.toHaveBeenCalled();
    });

    it('should return early when on mobile but qrUri is empty string', () => {
      routeMobileExternalWallet('');

      expect(isMobile).toHaveBeenCalled();
      expect(isTelegram).not.toHaveBeenCalled();
      expect(isAndroid).not.toHaveBeenCalled();
      expect(mockDocument.createElement).not.toHaveBeenCalled();
      expect(mockWindow.open).not.toHaveBeenCalled();
    });

    describe('non-Telegram scenarios', () => {
      beforeEach(() => {
        vi.mocked(isTelegram).mockReturnValue(false);
      });

      it('should create and click link element for HTTP URIs', () => {
        const qrUri = 'https://example.com/wallet-connect';

        routeMobileExternalWallet(qrUri);

        expect(isMobile).toHaveBeenCalled();
        expect(isTelegram).toHaveBeenCalled();
        expect(mockDocument.createElement).toHaveBeenCalledWith('a');
        expect(mockLink.href).toBe(qrUri);
        expect(mockLink.target).toBe('_blank');
        expect(mockLink.rel).toBe('noreferrer noopener');
        expect(mockLink.click).toHaveBeenCalled();
        expect(mockWindow.open).not.toHaveBeenCalled();
      });

      it('should create and click link element for HTTPS URIs', () => {
        const qrUri = 'http://example.com/wallet-connect';

        routeMobileExternalWallet(qrUri);

        expect(isMobile).toHaveBeenCalled();
        expect(isTelegram).toHaveBeenCalled();
        expect(mockDocument.createElement).toHaveBeenCalledWith('a');
        expect(mockLink.href).toBe(qrUri);
        expect(mockLink.target).toBe('_blank');
        expect(mockLink.rel).toBe('noreferrer noopener');
        expect(mockLink.click).toHaveBeenCalled();
        expect(mockWindow.open).not.toHaveBeenCalled();
      });

      it('should use window.location.href for non-HTTP URIs', () => {
        const qrUri = 'metamask://wallet-connect';

        routeMobileExternalWallet(qrUri);

        expect(isMobile).toHaveBeenCalled();
        expect(isTelegram).toHaveBeenCalled();
        expect(mockDocument.createElement).not.toHaveBeenCalled();
        expect(mockLink.click).not.toHaveBeenCalled();
        expect(mockWindow.open).not.toHaveBeenCalled();
        expect(mockWindow.location.href).toBe(qrUri);
      });

      it('should use window.location.href for wallet scheme URIs', () => {
        const qrUri = 'wallet://connect';

        routeMobileExternalWallet(qrUri);

        expect(isMobile).toHaveBeenCalled();
        expect(isTelegram).toHaveBeenCalled();
        expect(mockDocument.createElement).not.toHaveBeenCalled();
        expect(mockLink.click).not.toHaveBeenCalled();
        expect(mockWindow.open).not.toHaveBeenCalled();
        expect(mockWindow.location.href).toBe(qrUri);
      });
    });

    describe('Telegram scenarios', () => {
      beforeEach(() => {
        vi.mocked(isTelegram).mockReturnValue(true);
      });

      it('should encode URI and use window.open on Android', () => {
        vi.mocked(isAndroid).mockReturnValue(true);
        const qrUri = 'https://example.com/wallet-connect?param=value&other=test';
        const encodedUri = encodeURI(qrUri);

        routeMobileExternalWallet(qrUri);

        expect(isMobile).toHaveBeenCalled();
        expect(isTelegram).toHaveBeenCalled();
        expect(isAndroid).toHaveBeenCalled();
        expect(mockWindow.open).toHaveBeenCalledWith(encodedUri, '_blank', 'noreferrer noopener');
        expect(mockDocument.createElement).not.toHaveBeenCalled();
        expect(mockLink.click).not.toHaveBeenCalled();
      });

      it('should use window.open without encoding on non-Android', () => {
        vi.mocked(isAndroid).mockReturnValue(false);
        const qrUri = 'https://example.com/wallet-connect?param=value&other=test';

        routeMobileExternalWallet(qrUri);

        expect(isMobile).toHaveBeenCalled();
        expect(isTelegram).toHaveBeenCalled();
        expect(isAndroid).toHaveBeenCalled();
        expect(mockWindow.open).toHaveBeenCalledWith(qrUri, '_blank', 'noreferrer noopener');
        expect(mockDocument.createElement).not.toHaveBeenCalled();
        expect(mockLink.click).not.toHaveBeenCalled();
      });

      it('should handle wallet scheme URIs in Telegram on Android', () => {
        vi.mocked(isAndroid).mockReturnValue(true);
        const qrUri = 'metamask://wallet-connect';
        const encodedUri = encodeURI(qrUri);

        routeMobileExternalWallet(qrUri);

        expect(isMobile).toHaveBeenCalled();
        expect(isTelegram).toHaveBeenCalled();
        expect(isAndroid).toHaveBeenCalled();
        expect(mockWindow.open).toHaveBeenCalledWith(encodedUri, '_blank', 'noreferrer noopener');
        expect(mockDocument.createElement).not.toHaveBeenCalled();
        expect(mockLink.click).not.toHaveBeenCalled();
      });

      it('should handle wallet scheme URIs in Telegram on non-Android', () => {
        vi.mocked(isAndroid).mockReturnValue(false);
        const qrUri = 'metamask://wallet-connect';

        routeMobileExternalWallet(qrUri);

        expect(isMobile).toHaveBeenCalled();
        expect(isTelegram).toHaveBeenCalled();
        expect(isAndroid).toHaveBeenCalled();
        expect(mockWindow.open).toHaveBeenCalledWith(qrUri, '_blank', 'noreferrer noopener');
        expect(mockDocument.createElement).not.toHaveBeenCalled();
        expect(mockLink.click).not.toHaveBeenCalled();
      });
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      vi.mocked(isMobile).mockReturnValue(true);
    });

    it('should handle undefined qrUri parameter', () => {
      routeMobileExternalWallet(undefined);

      expect(isMobile).toHaveBeenCalled();
      expect(isTelegram).not.toHaveBeenCalled();
      expect(isAndroid).not.toHaveBeenCalled();
      expect(mockDocument.createElement).not.toHaveBeenCalled();
      expect(mockWindow.open).not.toHaveBeenCalled();
    });

    it('should handle null qrUri parameter', () => {
      routeMobileExternalWallet(null as any);

      expect(isMobile).toHaveBeenCalled();
      expect(isTelegram).not.toHaveBeenCalled();
      expect(isAndroid).not.toHaveBeenCalled();
      expect(mockDocument.createElement).not.toHaveBeenCalled();
      expect(mockWindow.open).not.toHaveBeenCalled();
    });

    it('should handle URIs with edge case protocols on non-Telegram mobile', () => {
      vi.mocked(isTelegram).mockReturnValue(false);
      const qrUri = 'trust://wallet-connect';

      routeMobileExternalWallet(qrUri);

      expect(isMobile).toHaveBeenCalled();
      expect(isTelegram).toHaveBeenCalled();
      expect(mockWindow.location.href).toBe(qrUri);
      expect(mockDocument.createElement).not.toHaveBeenCalled();
      expect(mockWindow.open).not.toHaveBeenCalled();
    });

    it('should handle empty string URI with startsWith check', () => {
      vi.mocked(isTelegram).mockReturnValue(false);
      const qrUri = '';

      routeMobileExternalWallet(qrUri);

      // Should return early due to !qrUri check
      expect(isMobile).toHaveBeenCalled();
      expect(isTelegram).not.toHaveBeenCalled();
      expect(mockDocument.createElement).not.toHaveBeenCalled();
      expect(mockWindow.open).not.toHaveBeenCalled();
    });
  });
});
