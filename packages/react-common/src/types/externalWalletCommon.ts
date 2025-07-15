import ParaWeb, {
  AuthStateLogin,
  AuthStateVerify,
  ExternalWalletInfo,
  TExternalWallet,
  TWalletType,
  Wallet,
} from '@getpara/web-sdk';

export type WalletMetadata = {
  id: string;
  internalId: TExternalWallet;
  name: string;
  iconUrl: string;
  rdns?: string;
  installed?: boolean;
  isExtension?: boolean;
  isMobile?: boolean;
  isWeb?: boolean;
  downloadUrl?: string;
  getQrUri?: () => Promise<string>;
  downloadUrls?: {
    android?: string;
    ios?: string;
    mobile?: string;
    qrCode?: string;
    chrome?: string;
    edge?: string;
    firefox?: string;
    opera?: string;
    safari?: string;
    browserExtension?: string;
    macos?: string;
    windows?: string;
    linux?: string;
    desktop?: string;
  };
  hasIosSafariExtension?: boolean;
};

export type CommonWallet = {
  connect: (isConnectionOnly?: boolean) => Promise<{
    address?: string;
    ethAddress?: string;
    error?: string;
    authState?: AuthStateLogin | AuthStateVerify;
  }>;
  connectMobile: (
    isManualWalletConnect?: boolean,
    isConnectionOnly?: boolean,
  ) => Promise<{ address?: string; ethAddress?: string; error?: string; authState?: AuthStateLogin | AuthStateVerify }>;
  type: TWalletType;
} & WalletMetadata;

export type CommonChain = {
  id: string | number;
  name: string;
};

export type SignArgs = {
  message: string;
  externalWallet?: ExternalWalletInfo;
};

export type SignResult = {
  address?: string;
  signature?: string;
  error?: string;
};

export type SwitchChainResult = {
  error: string[];
} | void;

export type ConnectParaEmbedded = {
  connectParaEmbedded: () => Promise<{ result?: unknown; error?: string }>;
};

export type ChainManagement<ChainId, R extends SwitchChainResult = SwitchChainResult> = {
  chains: CommonChain[];
  chainId?: ChainId;
  switchChain: (_: ChainId) => Promise<R>;
};

export type BalanceManagement<B = string> = {
  balance?: B;
  getWalletBalance: () => Promise<B | undefined>;
};

export type FarcasterMiniAppManagement = {
  farcasterStatus:
    | { isPresent: false }
    | { isPresent: true; isConnected: false; address?: undefined }
    | { isPresent: true; isConnected: true; address: string }
    | undefined;
};

export type ExternalWalletContextType<S extends SignResult = SignResult> = {
  wallets: CommonWallet[];
  disconnect: () => Promise<void>;
  signMessage: (_: SignArgs) => Promise<S>;
  signVerificationMessage: () => Promise<S>;
  requestInfo: (_: TExternalWallet) => Promise<ExternalWalletInfo>;
  disconnectBase: (_?: TExternalWallet) => Promise<void>;
};

export type ExternalWalletProviderConfigBase = {
  onSwitchWallet?: (args: { address?: string; error?: string }) => void;
  para: ParaWeb;
  walletsWithFullAuth: TExternalWallet[];
  includeWalletVerification?: boolean;
  connectionOnly?: boolean;
  connectedWallet?: Omit<Wallet, 'signer'> | null;
};

export type ExternalWalletProviderConfig<W, P = {}> = ExternalWalletProviderConfigBase & {
  wallets: W[];
} & P;

export { type TExternalWallet };
