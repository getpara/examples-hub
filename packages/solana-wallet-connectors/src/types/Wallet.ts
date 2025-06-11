import { type WalletMetadata } from '@getpara/react-common';

export type Wallet = WalletMetadata;

export type CreateWalletFn = () => Wallet;

export type WalletList = CreateWalletFn[];
