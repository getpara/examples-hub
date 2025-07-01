import { Context, MutableRefObject } from 'react';
import ParaWeb, { TWalletType } from '@getpara/web-sdk';
import * as paraEvmLib from '@getpara/evm-wallet-connectors';
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
import { ModalStep, ParaModalProps } from '../../modal/index.js';
import { OAuthLogoVariantType } from '../../modal/types/modalProps.js';
import { type TExternalWallet } from '@getpara/react-common';

export interface ClientSlice {
  client?: ParaWeb;
  setClient: (_: ParaWeb) => void;
}

export interface ConfigSlice {
  appName: string;
  setAppName: (_: string) => void;
}

export interface AnalyticsSlice {
  providerProps: object;
  setProviderProps: (_: object) => void;
}

export interface ModalSlice {
  modalConfig?: ParaModalProps;
  setModalConfig: (_?: ParaModalProps) => void;

  isDarkTheme: boolean;
  oAuthLogoVariant: OAuthLogoVariantType;

  isOpen: boolean;
  setIsOpen: (_: boolean) => void;

  openedToStep: MutableRefObject<ModalStep | null>;
}

export interface WalletSlice {
  rpcUrl?: string;
  setRpcUrl: (_?: string) => void;

  selectedWalletId?: string;
  selectedWalletType?: TWalletType;
  setSelectedWallet: (_?: string, __?: TWalletType) => void;
  clearSelectedWallet: () => void;
}
export interface ExternalWalletsSlice {
  externalWallets: TExternalWallet[];
  setExternalWallets: (_: TExternalWallet[]) => void;

  connectionOnly: boolean;
  setConnectionOnly: (_: boolean) => void;

  includeWalletVerification: boolean;
  setIncludeWalletVerification: (_: boolean) => void;

  externalWalletsWithFullAuth: TExternalWallet[];
  setExternalWalletsWithFullAuth: (_: TExternalWallet[]) => void;

  evmLib: typeof paraEvmLib | undefined;
  setEvmLib: (_: typeof paraEvmLib) => void;
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

  onLoginRef: MutableRefObject<(() => Promise<void>) | null>;
}

export type Store = ClientSlice & ModalSlice & WalletSlice & ExternalWalletsSlice & ConfigSlice & AnalyticsSlice;
