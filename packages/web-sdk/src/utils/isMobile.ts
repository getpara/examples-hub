export function isAndroid(): boolean {
  return typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
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
  return (
    typeof navigator !== 'undefined' &&
    /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(
      navigator.userAgent,
    )
  );
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
