import { AxiosInstance } from 'axios';
import Client, {
  EmailTheme,
  Network,
  OnRampAsset,
  OnRampProvider,
  WalletScheme,
  WalletType,
} from '@getpara/user-management-client';
import { Theme } from './theme.js';

export enum Environment {
  // Internal Environments
  DEV = 'DEV',
  SANDBOX = 'SANDBOX',
  BETA = 'BETA',
  PROD = 'PROD',
  // Customer-Facing Environments
  // NOTE: these resolve to the corresponding internal environments for convenience
  DEVELOPMENT = 'BETA',
  PRODUCTION = 'PROD',
}

export interface Ctx {
  env: Environment;
  apiKey: string;
  client: Client;
  disableWorkers?: boolean;
  offloadMPCComputationURL?: string;
  mpcComputationClient?: AxiosInstance;
  useLocalFiles?: boolean;
  useDKLS?: boolean;
  disableWebSockets: boolean;
  wasmOverride?: ArrayBuffer;
  cosmosPrefix?: string;
  isE2E?: boolean;
}

export type deprecated__NetworkProp = keyof typeof Network | Network;

export type deprecated__OnRampProviderProp = keyof typeof OnRampProvider | OnRampProvider;

export type WalletTypeProp = keyof typeof WalletType | WalletType;

export type WalletSchemeProp = keyof typeof WalletScheme | WalletScheme;

export type WalletFilters = {
  type?: WalletTypeProp[];
  scheme?: WalletSchemeProp[];
  forbidPregen?: boolean;
};

export type deprecated__RampConfig = {
  id: deprecated__OnRampProviderProp;
  hostApiKey: string;
};

export type deprecated__StripeConfig = {
  id: deprecated__OnRampProviderProp;
};

export type deprecated__OnRampAssetProp = keyof typeof OnRampAsset | OnRampAsset;

export type deprecated__OnRampConfigProvider = deprecated__RampConfig | deprecated__StripeConfig;

export enum EnabledFlow {
  BUY = 'BUY',
  RECEIVE = 'RECEIVE',
  WITHDRAW = 'WITHDRAW',
}

export type deprecated__EnabledFlowProp = keyof typeof EnabledFlow | EnabledFlow;

export type deprecated__OnRampConfig = {
  /*
   * If true, uses testnet chains for any funds purchased and allows provider-specific test payment methods
   */
  testMode?: boolean;
  /*
   * The on-chain asset to be purchased, passed to the chosen providers. Must be supported by the current user wallet.
   */
  asset: deprecated__OnRampAssetProp;
  /*
   * The network on which to purchase the chosen asset. One of `['ETHEREUM', 'ARBITRUM', 'BASE', 'OPTIMISM', 'POLYGON']`. If the
   * network and asset combination does not exist or is not supported by your chosen providers, modal instantiation will fail.
   * Defaults to 'ETHEREUM'
   */
  network: deprecated__NetworkProp;
  enabledFlows?: deprecated__EnabledFlowProp[];
  /*
   * Array of objects in the form `{id: 'STRIPE' | 'RAMP'}`. If using `RAMP`, you must also provide your API key: `{ id: 'RAMP', hostApiKey: '...' }`
   */
  providers: deprecated__OnRampConfigProvider[];
};

export type SupportedWalletTypeConfig = {
  optional?: boolean;
};

export type deprecated__SupportedWalletTypesOpt = {
  [WalletType.EVM]?: boolean | SupportedWalletTypeConfig;
  [WalletType.SOLANA]?: boolean | SupportedWalletTypeConfig;
  [WalletType.COSMOS]?: boolean | (SupportedWalletTypeConfig & { prefix?: string });
};

export type SupportedWalletTypes = { type: WalletType; optional?: boolean }[];

export interface ConstructorOpts {
  useStorageOverrides?: boolean;
  disableWorkers?: boolean;
  offloadMPCComputationURL?: string;
  useLocalFiles?: boolean;
  localStorageGetItemOverride?: (key: string) => Promise<string | null>;
  localStorageSetItemOverride?: (key: string, value: string) => Promise<void>;
  sessionStorageGetItemOverride?: (key: string) => Promise<string | null>;
  sessionStorageSetItemOverride?: (key: string, value: string) => Promise<void>;
  sessionStorageRemoveItemOverride?: (key: string) => Promise<void>;
  clearStorageOverride?: () => Promise<void>;
  /**
   * Hex color to use in the portal for the background color.
   * @deprecated use portalTheme instead
   */
  portalBackgroundColor?: string; // please use hex color codes
  /**
   * Hex color to use in the portal for the primary button.
   * @deprecated use portalTheme instead
   */
  portalPrimaryButtonColor?: string; // please use hex color codes
  /**
   * Hex text color to use in the portal.
   * @deprecated use portalTheme instead
   */
  portalTextColor?: string; // please use hex color codes
  /**
   * Hex color to use in the portal for the primary button text.
   * @deprecated use portalTheme instead
   */
  portalPrimaryButtonTextColor?: string; // please use hex color codes
  /**
   * Theme to use for the portal
   * @deprecated configure theming through the developer portal
   */
  portalTheme?: Theme;
  useDKLSForCreation?: boolean;
  disableWebSockets?: boolean;
  wasmOverride?: ArrayBuffer;
  /**
   * Base theme for the emails sent from this Para instance.
   * @default - dark
   * @deprecated configure theming through the developer portal
   */
  emailTheme?: EmailTheme;
  /**
   * Hex color to use as the primary color in the emails.
   * @default - #FE452B
   * @deprecated configure theming through the developer portal
   */
  emailPrimaryColor?: string;
  /**
   * Linkedin URL to link to in the emails. Should be a secure URL string starting with https://www.linkedin.com/company/.
   * @deprecated configure this through the developer portal
   */
  linkedinUrl?: string;
  /**
   * Github URL to link to in the emails. Should be a secure URL string starting with https://github.com/.
   * @deprecated configure this through the developer portal
   */
  githubUrl?: string;
  /**
   * X (Twitter) URL to link to in the emails. Should be a secure URL string starting with https://twitter.com/.
   * @deprecated configure this through the developer portal
   */
  xUrl?: string;
  /**
   * Support URL to link to in the emails. This can be a secure https URL or a mailto: string. Will default to using the stored application URL is nothing is provided here.
   * @deprecated homepageUrl will be used for this, configure it through the developer portal
   */
  supportUrl?: string;
  /**
   * URL for your home landing page. Should be a secure URL string starting with https://.
   * @deprecated configure this through the developer portal
   */
  homepageUrl?: string;
  /**
   * Which type of wallet your application supports, in the form `{ [WalletType]: true }`. Currently allowed values for `WalletType` are `'EVM'`, `'SOLANA'`, or `'COSMOS'`.
   *
   * To specify which prefix to use for new Cosmos wallets, pass `{ COSMOS: { prefix: 'your-prefix' } }`. Defaults to `'cosmos'`.
   * @deprecated Configure your app's supported wallet types in the Para Developer Portal.
   */
  supportedWalletTypes?: deprecated__SupportedWalletTypesOpt;
  /**
   * If `true`, the SDK will use the device's temporary session storage instead of saving user and wallet data to local storage.
   */
  useSessionStorage?: boolean;
  /**
   * Partner ID set in the Para Portal to track analytics for legacy SDK versions. This variable is unused outside of the Para Portal.
   */
  portalPartnerId?: string;
}
