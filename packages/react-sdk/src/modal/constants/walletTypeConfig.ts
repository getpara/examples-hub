import { IconType } from '@getpara/react-components';
import { TWalletType } from '@getpara/web-sdk';

export const WALLET_TYPE_CONFIG: Record<TWalletType, { name: string; icon: IconType }> = {
  EVM: {
    name: 'Ethereum',
    icon: 'ethCircle',
  },
  SOLANA: { name: 'Solana', icon: 'solanaCircle' },
  COSMOS: { name: 'Cosmos', icon: 'cosmosCircle' },
};
