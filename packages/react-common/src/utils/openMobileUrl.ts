import { isAndroid, isMobile, isTelegram } from '@getpara/web-sdk';

export const openMobileUrl = (url?: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (isMobile()) {
    if (!url) return;

    if (isTelegram()) {
      let href = url;
      if (isAndroid()) {
        // For Android Telegram, encode the entire URL for the WebView
        // But only if it's not already encoded
        try {
          // Test if URL is already encoded by trying to decode it
          const decoded = decodeURI(url);
          href = decoded === url ? encodeURI(url) : url;
        } catch {
          // If decode fails, encode it
          href = encodeURI(url);
        }
      }
      window.open(href, '_blank', 'noreferrer noopener');
    } else if (url.startsWith('http')) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noreferrer noopener';
      link.click();
    } else {
      window.location.href = url;
    }
  }
};
