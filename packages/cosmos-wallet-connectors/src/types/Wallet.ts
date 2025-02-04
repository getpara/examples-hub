import { WalletType } from '@getpara/graz';
import { WalletMetadata } from './CommonTypes.js';

export type WalletList = (() => WalletWithType)[];

export type WalletWithType = {
  grazType: WalletType;
  grazMobileType?: WalletType;
} & WalletMetadata;
