import { Connector } from 'wagmi';

export const emitWalletConnectUri = async (connector: Connector, uriConverter?: (uri: string) => string): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }

  const provider: any = await (connector.getProvider?.() ?? undefined);

  // Coinbase Wallet exposes a plain QR‑URL string on its provider
  if (connector.type === 'coinbaseWallet' && provider?.qrUrl) {
    window.dispatchEvent(new CustomEvent<string>('PARA_WALLETCONNECT_URI_READY', { detail: provider.qrUrl }));
  }

  // Abort early when the provider cannot emit `display_uri`
  if (!provider || (typeof provider.once !== 'function' && typeof provider.on !== 'function')) {
    throw new Error('display_uri event not supported for this connector');
  }

  const listen = typeof provider.once === 'function' ? provider.once.bind(provider) : provider.on.bind(provider);

  const cancel = setTimeout(() => console.error('display_uri event not emitted'), 10_000);

  listen('display_uri', (uri: string) => {
    clearTimeout(cancel);
    window.dispatchEvent(
      new CustomEvent<string>('PARA_WALLETCONNECT_URI_READY', { detail: uriConverter ? uriConverter(uri) : uri }),
    );
  });
};
