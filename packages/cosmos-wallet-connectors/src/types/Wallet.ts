import { WalletMetadata } from './CommonTypes';
import { Network, WalletExtensionProvider, WalletMobileProvider } from '@delphi-labs/shuttle-react';

export type WalletList = (({ networks }: { networks: Network[] }) => WalletWithProviders)[];

export type WalletWithProviders = {
  extensionProvider?: WalletExtensionProvider;
  mobileProvider?: WalletMobileProvider;
} & WalletMetadata;
