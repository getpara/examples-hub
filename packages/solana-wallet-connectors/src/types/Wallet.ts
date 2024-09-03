import { WalletMetadata } from './CommonTypes';

export type Wallet = {
  getUri?: (uri: string) => string;
} & WalletMetadata;

export type CreateWalletFn = () => Wallet;

export type WalletList = CreateWalletFn[];
