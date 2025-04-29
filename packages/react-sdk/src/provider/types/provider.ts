import { ParaWagmiProviderProps } from '@getpara/evm-wallet-connectors';
import ParaWeb, {
  AccountCreationEvent,
  AccountSetupEvent,
  ConstructorOpts,
  Environment,
  ExternalWalletChangeEvent,
  LoginEvent,
  LogoutEvent,
  PregenWalletClaimedEvent,
  SignMessageEvent,
  SignTransactionEvent,
  WalletCreatedEvent,
  WalletsChangeEvent,
  GuestWalletsCreatedEvent,
} from '@getpara/web-sdk';
import { PropsWithChildren } from 'react';
import { Chain, Transport } from 'viem';
import { ParaModalProps } from '../../modal/index.js';
import { ParaGrazProviderProps } from '@getpara/cosmos-wallet-connectors';
import {
  ParaCosmosProviderConfigNoWallets,
  ParaEvmProviderConfigNoWallets,
  ParaSolanaProviderConfigNoWallets,
} from './externalWalletProviders.js';
import { type TExternalWallet } from '@getpara/react-common';

export type Callbacks = {
  onLogout?: (event: LogoutEvent) => void;
  onLogin?: (event: LoginEvent) => void;
  onAccountSetup?: (event: AccountSetupEvent) => void;
  onAccountCreation?: (event: AccountCreationEvent) => void;
  onSignMessage?: (event: SignMessageEvent) => void;
  onSignTransaction?: (event: SignTransactionEvent) => void;
  onExternalWalletChange?: (event: ExternalWalletChangeEvent) => void;
  onWalletsChange?: (event: WalletsChangeEvent) => void;
  onWalletCreated?: (event: WalletCreatedEvent) => void;
  onPregenWalletClaimed?: (event: PregenWalletClaimedEvent) => void;
  onGuestWalletsCreated?: (event: GuestWalletsCreatedEvent) => void;
};

export type ParaProviderConfig = {
  /**
   * The name of your app, used throughout the modal and any configured external wallets.
   */
  appName: string;
  /**
   * Disables the automatic session keep alive that's provided by ParaProvider.
   */
  disableAutoSessionKeepAlive?: boolean;
  /**
   * Disables the ParaModal that's provided by ParaProvider. Use this is you're providing a separate modal in another location in your app.
   */
  disableEmbeddedModal?: boolean;
  /**
   * RPC url to use for retrieving the embedded wallet balance
   */
  rpcUrl?: string;
};

export type ExternalWalletConfig<
  chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]['id'], Transport>,
> = {
  /**
   * A description of your app, displayed in some external wallets.
   */
  appDescription?: string;
  /**
   * A URL for your app, displayed in some external wallets.
   */
  appUrl?: string;
  /**
   * An icon for your app, displayed in some external wallets.
   */
  appIcon?: string;
  /**
   * Config for the EVM external wallets connector using Wagmi.
   *
   * NOTE: In addition to this config, you MUST also have the `@getpara/evm-wallet-connectors` package installed.
   */
  evmConnector?: {
    /**
     * Config for the Para EVM external wallets connector.
     */
    config: Omit<
      ParaEvmProviderConfigNoWallets<chains, transports>,
      'appName' | 'appDescription' | 'appUrl' | 'appIcon' | 'projectId'
    >;
    /**
     * Config for the Wagmi provider.
     */
    wagmiProviderProps?: ParaWagmiProviderProps;
  };
  /**
   * Config for the Cosmos external wallets connector using Graz.
   *
   * NOTE: In addition to this config, you MUST also have the `@getpara/cosmos-wallet-connectors` package installed.
   */
  cosmosConnector?: {
    /**
     * Config for the Para Cosmos external wallets connector.
     */
    config: ParaCosmosProviderConfigNoWallets;
    /**
     * Config for the Graz provider.
     */
    grazProviderProps?: ParaGrazProviderProps;
  };
  /**
   * Config for the Solana external wallets connector using @solana/wallet-adapter-react.
   *
   * NOTE: In addition to this config, you MUST also have the `@getpara/solana-wallet-connectors` package installed.
   */
  solanaConnector?: {
    /**
     * Config for the Para Solana external wallets connector.
     */
    config: Omit<ParaSolanaProviderConfigNoWallets, 'appIdentity'> &
      Pick<Partial<ParaSolanaProviderConfigNoWallets>, 'appIdentity'>;
  };
  /**
   * Config for any connectors that use Wallet Connect.
   */
  walletConnect?: {
    /**
     * Your Wallet Connect project ID.
     */
    projectId: string;
  };
  /**
   * Which external wallets to show and in what order they should be displayed.
   *
   * NOTE: Any wallets that are detected as installed will be sorted first, followed by those that are not detected or not installed.
   */
  wallets?: TExternalWallet[];
  /**
   * Array of external wallets that will also include linked embedded wallets.
   *
   * You can also pass `ALL` to include linked embedded wallets for all external wallets.
   */
  createLinkedEmbeddedForExternalWallets?: TExternalWallet[] | 'ALL';
};

export interface ParaProviderProps<
  chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]['id'], Transport>,
> extends PropsWithChildren {
  /**
   * Arguments to setup a new Para instance, or a Para instance you have already instantiated.
   */
  paraClientConfig:
    | {
        /**
         * Environment for your Para instance.
         */
        env: Environment;
        /**
         * API key for you Para instance.
         *
         * NOTE: Be sure this key matches the environment.
         */
        apiKey: string;
        opts?: ConstructorOpts;
      }
    | ParaWeb;
  /**
   * Configuration used for the Para modal.
   */
  paraModalConfig?: ParaModalProps;
  /**
   * Callbacks fired for events from the Para instance.
   */
  callbacks?: Callbacks;
  /**
   * Config for the ParaProvider.
   */
  config: ParaProviderConfig;
  /**
   * Config for any external wallets.
   */
  externalWalletConfig?: ExternalWalletConfig<chains, transports>;
}
