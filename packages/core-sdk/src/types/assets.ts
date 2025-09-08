import { TNetwork, TOnRampAsset } from '@getpara/user-management-client';
import { Wallet } from './wallet.js';

export type AssetTransferType = 'INBOUND' | 'OUTBOUND';

export type AssetTransfer = {
  wallet: Omit<Wallet, 'signer'>;
  type: AssetTransferType;
  sourceAddress: string;
  destinationAddress: string;
  asset: TOnRampAsset;
  network: TNetwork;
  quantity: string;
  chainId?: string;
  contractAddress?: string;
};
