import { Connector, CreateConnectorFn } from 'wagmi';
import { WalletConnectParameters } from 'wagmi/connectors';
import { CoinbaseWalletOptions } from '../wallets/connectors/coinbase/coinbase.js';
import { WalletConnectWalletOptions } from '../wallets/connectors/walletConnect/walletConnect.js';
import { WalletMetadata } from './CommonTypes.js';

export type Wallet = {
  createConnector?: (walletDetails: WalletDetailsParams) => CreateConnectorFn;
  createMobileConnector?: (walletDetails: WalletDetailsParams) => CreateConnectorFn;
  getUri?: (uri: string) => string;
} & WalletMetadata;

export interface DefaultWalletOptions {
  projectId: string;
  walletConnectParameters?: CapsuleWalletConnectParameters;
}

export type CreateWalletFn = (
  // These parameters will be used when creating a wallet. If injected
  // wallet doesn't have parameters it will just ignore these passed in parameters
  // createWalletParams: CoinbaseWalletOptions & Omit<WalletConnectWalletOptions, 'projectId'> & DefaultWalletOptions,
  createWalletParams: CoinbaseWalletOptions & Omit<WalletConnectWalletOptions, 'projectId'> & DefaultWalletOptions,
) => Wallet;

export type WalletList = CreateWalletFn[];

// We don't want users to pass in `showQrModal` or `projectId`.
// Those two values are handled by Capsule. The rest of WalletConnect
// parameters can be passed with no issue
export type CapsuleWalletConnectParameters = Omit<WalletConnectParameters, 'showQrModal' | 'projectId'>;

export type CapsuleDetails = Omit<Wallet, 'createConnector' | 'createWCConnector' | 'hidden'> & {
  isWalletConnectModalConnector?: boolean;
  isCapsuleConnector: boolean;
  walletConnectModalConnector?: Connector;
  // Used specifically in `connectorsForWallets` logic
  // to make sure we can also get WalletConnect modal in Capsule
  showQrModal?: true;
};

export type WalletDetailsParams = { capsuleDetails: CapsuleDetails };

export type CreateConnector = (walletDetails: { capsuleDetails: CapsuleDetails }) => CreateConnectorFn;

// This is the default connector you get at first from wagmi
// "Connector" + Capsule details we inject into the connector
export type WagmiConnectorInstance = Connector & {
  // this is optional since we only get
  // capsuleDetails if we use Capsule connectors
  capsuleDetails?: CapsuleDetails;
  walletConnectModalConnector?: WagmiConnectorInstance;
};

// This will be the wallet instance we will return
// in the Capsule connect modal
export type WalletInstance = Connector & CapsuleDetails;
