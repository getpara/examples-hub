import { OAUTH_METHODS, ExternalWallet, Network, OnRampProvider, Environment } from '@getpara/react-sdk';
import { Network as CosmosNetwork } from '@delphi-labs/shuttle';
import {
  MailIcon,
  PhoneIcon,
  GoogleIcon,
  TwitterIcon,
  DiscordIcon,
  FarcasterIcon,
  MetaMaskIcon,
  RainbowIcon,
  CoinbaseIcon,
  WalletConnectIcon,
  ZerionIcon,
  FacebookIcon,
  AppleIcon,
  StripeIcon,
  RampIcon,
  MoonPayIcon,
  PhantomIcon,
  GlowIcon,
  BackpackIcon,
  TelegramIcon,
  LeapIcon,
  KeplrIcon,
  RabbyIcon,
  SafeIcon,
  SolflareIcon,
} from '../assets';
import {
  AuthMethod,
  ExternalWallet as CustomExternalWallet,
  DropdownOption,
  ModalBuilderConfig,
  DraggableItemHeaderConfig,
  TAuthLayout,
} from '../types';

export const ALL_AUTH_METHODS: AuthMethod[] = ['email-auth', 'phone-auth', ...OAUTH_METHODS] as const;

export const ALL_EXTERNAL_WALLETS: CustomExternalWallet[] = Object.keys(ExternalWallet) as CustomExternalWallet[];

export const AUTH_SECTION_IDS = ['web2', 'web3'] as const;

export const AUTH_METHOD_CONFIGS: Partial<Record<AuthMethod, DraggableItemHeaderConfig>> = {
  'email-auth': { logo: MailIcon, label: 'Email' },
  'phone-auth': { logo: PhoneIcon, label: 'Phone' },
  'GOOGLE': { logo: GoogleIcon, label: 'Google' },
  'TWITTER': { logo: TwitterIcon, label: 'Twitter' },
  'DISCORD': { logo: DiscordIcon, label: 'Discord' },
  'FARCASTER': { logo: FarcasterIcon, label: 'Farcaster' },
  'FACEBOOK': { logo: FacebookIcon, label: 'Facebook' },
  'APPLE': { logo: AppleIcon, label: 'Apple' },
  'TELEGRAM': { logo: TelegramIcon, label: 'Telegram' },
};

export const EXTERNAL_WALLET_CONFIGS: Partial<Record<CustomExternalWallet, DraggableItemHeaderConfig>> = {
  [ExternalWallet.METAMASK]: { logo: MetaMaskIcon, label: 'MetaMask' },
  [ExternalWallet.RAINBOW]: { logo: RainbowIcon, label: 'Rainbow' },
  [ExternalWallet.COINBASE]: { logo: CoinbaseIcon, label: 'Coinbase' },
  [ExternalWallet.WALLETCONNECT]: { logo: WalletConnectIcon, label: 'WalletConnect' },
  [ExternalWallet.ZERION]: { logo: ZerionIcon, label: 'Zerion' },
  [ExternalWallet.RABBY]: { logo: RabbyIcon, label: 'Rabby' },
  [ExternalWallet.SAFE]: { logo: SafeIcon, label: 'Safe' },
  [ExternalWallet.PHANTOM]: { logo: PhantomIcon, label: 'Phantom' },
  [ExternalWallet.GLOW]: { logo: GlowIcon, label: 'Glow' },
  [ExternalWallet.BACKPACK]: { logo: BackpackIcon, label: 'Backpack' },
  [ExternalWallet.SOLFLARE]: { logo: SolflareIcon, label: 'Solflare' },
  [ExternalWallet.LEAP]: { logo: LeapIcon, label: 'Leap' },
  [ExternalWallet.KEPLR]: { logo: KeplrIcon, label: 'Keplr' },
};

export const ONRAMPS_CONFIGS: Record<OnRampProvider, DraggableItemHeaderConfig> = {
  [OnRampProvider.STRIPE]: { logo: StripeIcon, label: 'Stripe' },
  [OnRampProvider.RAMP]: { logo: RampIcon, label: 'Ramp' },
  [OnRampProvider.MOONPAY]: { logo: MoonPayIcon, label: 'MoonPay' },
};

export const MODAL_BUILDER_DEFAULT_CONFIG: ModalBuilderConfig = {
  appearance: {
    theme: {},
    logo: '',
  },
  networks: {
    networks: [Network.ETHEREUM, Network.SOLANA, Network.COSMOS],
  },
  authentication: {
    oAuthMethods: ['GOOGLE', 'FARCASTER'],
    disableEmailLogin: false,
    disablePhoneLogin: false,
    authLayout: ['AUTH:FULL', 'EXTERNAL:FULL'] as TAuthLayout[],
    externalWallets: [ExternalWallet.METAMASK, ExternalWallet.PHANTOM, ExternalWallet.SAFE],
    isWeb2AuthEnabled: true,
    isWeb3AuthEnabled: true,
    isGuestModeEnabled: true,
  },
  security: {
    twoFactorAuthEnabled: false,
    recoverySecretStepEnabled: true,
  },
  onRamps: {
    onRampTestMode: true,
  },
  offRamps: {},
  depositCrypto: {},
  wallets: {
    hideWallets: false,
  },
};

export const COSMOS_CHAINS: CosmosNetwork[] = [
  {
    name: 'Mars Hub',
    chainId: 'mars-1',
    chainPrefix: 'mars',
    rpc: 'https://rpc.marsprotocol.io/',
    rest: 'https://rest.marsprotocol.io/',
    defaultCurrency: {
      coinDenom: 'MARS',
      coinMinimalDenom: 'umars',
      coinDecimals: 6,
      coinGeckoId: 'mars',
    },
    gasPrice: '0.015umars',
  },
];

export const WALLET_CONNECT_PROJECT_ID: string = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
export const PARA_API_KEY: string = import.meta.env.VITE_CAPSULE_API_KEY;
export const PARA_ENVIRONMENT: Environment = import.meta.env.VITE_PARA_ENVIRONMENT ?? Environment.BETA;

export const BORDER_RADIUS_OPTIONS: DropdownOption[] = [
  { label: 'None', value: 'none' },
  { label: 'Extra Small', value: 'xs' },
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
  { label: 'Extra Large', value: 'xl' },
  { label: 'Full', value: 'full' },
];

export const FONT_OPTIONS: DropdownOption[] = [
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Merriweather', value: 'Merriweather' },
  { label: 'Space Mono', value: 'Space Mono' },
  { label: 'Cormorant', value: 'Cormorant' },
  { label: 'Source Sans Pro', value: 'Source Sans Pro' },
  { label: 'Source Serif Pro', value: 'Source Serif Pro' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Rubik', value: 'Rubik' },
];
