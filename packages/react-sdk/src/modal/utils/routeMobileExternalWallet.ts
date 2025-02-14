import { isAndroid, isMobile, isTelegram } from '@getpara/web-sdk';

export const routeMobileExternalWallet = (qrUri?: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (isMobile()) {
    if (!qrUri) return;

    if (!isTelegram() && qrUri.startsWith('http')) {
      // Workaround for https://github.com/rainbow-me/rainbowkit/issues/524.
      // Using 'window.open' causes issues on iOS in non-Safari browsers and
      // WebViews where a blank tab is left behind after connecting.
      // This is especially bad in some WebView scenarios (e.g. following a
      // link from Twitter) where the user doesn't have any mechanism for
      // closing the blank tab.
      // For whatever reason, links with a target of "_blank" don't suffer
      // from this problem, and programmatically clicking a detached link
      // element with the same attributes also avoids the issue.
      const link = document.createElement('a');
      link.href = qrUri;
      link.target = '_blank';
      link.rel = 'noreferrer noopener';
      link.click();
    } else {
      if (isTelegram()) {
        let href = qrUri;
        if (isAndroid()) {
          href = encodeURI(qrUri);
        }
        window.open(href, '_blank', 'noreferrer noopener');
      } else {
        window.location.href = qrUri;
      }
    }
  }
};
