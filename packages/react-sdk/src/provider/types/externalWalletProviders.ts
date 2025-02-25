import { ParaCosmosProviderConfig } from '@getpara/cosmos-wallet-connectors';
import { TExternalWallet } from '../../modal/index.js';
import { ParaSolanaProviderConfig } from '@getpara/solana-wallet-connectors';
import { Chain, Transport } from 'viem';
import { ParaEvmProviderConfig } from '@getpara/evm-wallet-connectors';

export type ExternalWalletProviderCommon = {
  isUsing: boolean;
  wallets: TExternalWallet[];
};

export type ParaEvmProviderConfigNoWallets<
  chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]['id'], Transport>,
> = Omit<ParaEvmProviderConfig<chains, transports>, 'wallets'>;
export type ParaCosmosProviderConfigNoWallets = Omit<ParaCosmosProviderConfig, 'wallets'>;
export type ParaSolanaProviderConfigNoWallets = Omit<ParaSolanaProviderConfig, 'wallets'>;
