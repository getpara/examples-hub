import { WalletType } from '@getpara/graz';
import { type WalletMetadata } from '@getpara/react-common';

export type WalletList = (() => WalletWithType)[];

export type WalletWithType = {
  grazType: WalletType;
  grazMobileType?: WalletType;
} & WalletMetadata;
