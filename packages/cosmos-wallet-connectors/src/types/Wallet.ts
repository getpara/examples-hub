import { WalletType } from 'graz';
import { type WalletMetadata } from '@getpara/react-common';

export type WalletList = (() => WalletWithType)[];

export type WalletWithType = {
  grazType: WalletType;
  grazMobileType?: WalletType;
} & WalletMetadata;
