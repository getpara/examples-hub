import { Connector } from 'wagmi';

export const getWalletConnectUri = async (connector: Connector, uriConverter?: (uri: string) => string): Promise<string> => {
  const provider = await connector.getProvider();

  if (connector.type === 'coinbaseWallet') {
    // @ts-expect-error
    return provider.qrUrl;
  }

  return new Promise<string>(resolve =>
    // Wagmi v2 doesn't have a return type for provider yet
    // @ts-expect-error
    provider.once('display_uri', uri => {
      resolve(uriConverter ? uriConverter(uri) : uri);
    }),
  );
};
