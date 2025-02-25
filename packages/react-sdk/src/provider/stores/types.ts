import { Context } from 'react';
import ParaWeb, { WalletType } from '@getpara/web-sdk';
import { EvmExternalWalletContextType, ParaEvmProvider, WalletList as EvmWalletList } from '@getpara/evm-wallet-connectors';
import {
  CosmosExternalWalletContextType,
  ParaCosmosProvider,
  WalletList as CosmosWalletList,
} from '@getpara/cosmos-wallet-connectors';
import {
  ParaSolanaProvider,
  SolanaExternalWalletContextType,
  WalletList as SolanaWalletList,
} from '@getpara/solana-wallet-connectors';
import { ParaModalProps, TExternalWallet } from '../../modal/index.js';
import { OAuthLogoVariantType } from '../../modal/types/modalProps.js';

export interface ClientSlice {
  client?: ParaWeb;
  setClient: (_: ParaWeb) => void;
}

export interface ConfigSlice {
  appName: string;
  setAppName: (_: string) => void;
}

export interface ModalSlice {
  modalConfig?: ParaModalProps;
  setModalConfig: (_?: ParaModalProps) => void;

  isDarkTheme: boolean;
  oAuthLogoVariant: OAuthLogoVariantType;

  isOpen: boolean;
  setIsOpen: (_: boolean) => void;
}

export interface WalletSlice {
  selectedWalletId?: string;
  selectedWalletType?: WalletType;
  setSelectedWallet: (_?: string, __?: WalletType) => void;
  clearSelectedWallet: () => void;
}
export interface ExternalWalletsSlice {
  externalWallets: TExternalWallet[];
  setExternalWallets: (_: TExternalWallet[]) => void;

  evmContext: Context<EvmExternalWalletContextType>;
  setEvmContext: (_: Context<EvmExternalWalletContextType>) => void;
  EvmProvider?: typeof ParaEvmProvider;
  setEvmProvider: (_: typeof ParaEvmProvider) => void;
  evmWallets: EvmWalletList;
  setEvmWallets: (_: EvmWalletList) => void;
  isLoadingEvmLib: boolean;
  setIsLoadingEvmLib: (_: boolean) => void;

  cosmosContext: Context<CosmosExternalWalletContextType>;
  setCosmosContext: (_: Context<CosmosExternalWalletContextType>) => void;
  CosmosProvider?: typeof ParaCosmosProvider;
  setCosmosProvider: (_: typeof ParaCosmosProvider) => void;
  cosmosWallets: CosmosWalletList;
  setCosmosWallets: (_: CosmosWalletList) => void;
  isLoadingCosmosLib: boolean;
  setIsLoadingCosmosLib: (_: boolean) => void;

  solanaContext: Context<SolanaExternalWalletContextType>;
  setSolanaContext: (_: Context<SolanaExternalWalletContextType>) => void;
  SolanaProvider?: typeof ParaSolanaProvider;
  setSolanaProvider: (_: typeof ParaSolanaProvider) => void;
  solanaWallets: SolanaWalletList;
  setSolanaWallets: (_: SolanaWalletList) => void;
  isLoadingSolanaLib: boolean;
  setIsLoadingSolanaLib: (_: boolean) => void;
}

export type Store = ClientSlice & ModalSlice & WalletSlice & ExternalWalletsSlice & ConfigSlice;
