import { WalletMetadata } from './CommonTypes.js';

export type Wallet = {
  getUri?: (uri: string) => string;
} & WalletMetadata;

export type CreateWalletFn = () => Wallet;

export type WalletList = CreateWalletFn[];
