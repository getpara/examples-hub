export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;

  const userAgent = navigator.userAgent.toLowerCase();

  // Check multiple indicators
  return (
    /android/i.test(userAgent) ||
    /linux.*mobile/i.test(userAgent) ||
    (navigator.platform && navigator.platform.toLowerCase().includes('android'))
  );
}

export function isSmallIOS(): boolean {
  return typeof navigator !== 'undefined' && /iPhone|iPod/.test(navigator.userAgent);
}

export function isLargeIOS(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    (/iPad/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  );
}

export function isTablet(): boolean {
  if (typeof navigator === 'undefined') return false;

  const userAgent = navigator.userAgent.toLowerCase();

  // iPad detection (including iPad Pro on desktop Safari)
  if (/ipad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return true;
  }

  // Android tablet detection - look for explicit tablet indicators
  if (/android/.test(userAgent)) {
    // Only consider it a tablet if it explicitly says "tablet" or has certain screen characteristics
    return (
      /tablet/.test(userAgent) ||
      (/android/.test(userAgent) && !/mobile/.test(userAgent) && typeof screen !== 'undefined' && screen.width >= 768)
    );
  }

  // Other known tablet patterns
  return /(tablet|kindle|playbook|silk)/.test(userAgent);
}

export function isIOS(): boolean {
  return isSmallIOS() || isLargeIOS();
}

export function isMobile(): boolean {
  return isAndroid() || isIOS();
}

export function isSafari(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    /AppleWebKit/i.test(navigator.userAgent) &&
    !/CriOS/i.test(navigator.userAgent) &&
    !/Chrome/i.test(navigator.userAgent)
  );
}

export function isIOSWebview(): boolean {
  const isStandalone = typeof navigator !== 'undefined' && !(navigator as any).standalone;
  return typeof navigator !== 'undefined' && isIOS() && !isStandalone && !/safari/i.test(navigator.userAgent.toLowerCase());
}

export function isMobileSafari(): boolean {
  return isMobile() && isSafari();
}

export function isTelegram() {
  return (
    typeof window !== 'undefined' &&
    (Boolean((window as any).TelegramWebviewProxy) ||
      Boolean((window as any).Telegram) ||
      Boolean((window as any).TelegramWebviewProxyProto))
  );
}
