import {
  KeplrExtensionProvider,
  KeplrMobileProvider,
  LeapCosmosExtensionProvider,
  LeapCosmosMobileProvider,
  Network,
  WalletExtensionProvider,
  WalletMobileProvider,
} from '@delphi-labs/shuttle-react';

export const providersById: Record<string, new ({ networks }: { networks: Network[] }) => WalletExtensionProvider> = {
  leap: LeapCosmosExtensionProvider,
  keplr: KeplrExtensionProvider,
};

export const mobileProvidersById: Record<string, new ({ networks }: { networks: Network[] }) => WalletMobileProvider> = {
  leap: LeapCosmosMobileProvider,
  keplr: KeplrMobileProvider,
};
