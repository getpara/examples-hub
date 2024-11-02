import { OAuthMethod, ExternalWallet, Network, AuthLayout, OnRampProvider } from '@usecapsule/react-sdk';
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
} from '../assets';
import {
  AuthMethod,
  ExternalWallet as CustomExternalWallet,
  DropdownOption,
  ModalBuilderConfig,
  DraggableItemHeaderConfig,
} from '../types';

export const ALL_AUTH_METHODS: AuthMethod[] = ['email-auth', 'phone-auth', ...Object.values(OAuthMethod)];

export const ALL_EXTERNAL_WALLETS: CustomExternalWallet[] = Object.keys(ExternalWallet) as CustomExternalWallet[];

export const AUTH_SECTION_IDS = ['web2', 'web3'] as const;

export const AUTH_METHOD_CONFIGS: Record<AuthMethod, DraggableItemHeaderConfig> = {
  'email-auth': { logo: MailIcon, label: 'Email' },
  'phone-auth': { logo: PhoneIcon, label: 'Phone' },
  [OAuthMethod.GOOGLE]: { logo: GoogleIcon, label: 'Google' },
  [OAuthMethod.TWITTER]: { logo: TwitterIcon, label: 'Twitter' },
  [OAuthMethod.DISCORD]: { logo: DiscordIcon, label: 'Discord' },
  [OAuthMethod.FARCASTER]: { logo: FarcasterIcon, label: 'Farcaster' },
  [OAuthMethod.FACEBOOK]: { logo: FacebookIcon, label: 'Facebook' },
  [OAuthMethod.APPLE]: { logo: AppleIcon, label: 'Apple' },
};

export const EXTERNAL_WALLET_CONFIGS: Record<CustomExternalWallet, DraggableItemHeaderConfig> = {
  [ExternalWallet.METAMASK]: { logo: MetaMaskIcon, label: 'MetaMask' },
  [ExternalWallet.RAINBOW]: { logo: RainbowIcon, label: 'Rainbow' },
  [ExternalWallet.COINBASE]: { logo: CoinbaseIcon, label: 'Coinbase' },
  [ExternalWallet.WALLETCONNECT]: { logo: WalletConnectIcon, label: 'WalletConnect' },
  [ExternalWallet.ZERION]: { logo: ZerionIcon, label: 'Zerion' },
  [ExternalWallet.PHANTOM]: { logo: PhantomIcon, label: 'Phantom' },
  [ExternalWallet.GLOW]: { logo: GlowIcon, label: 'Glow' },
  [ExternalWallet.BACKPACK]: { logo: BackpackIcon, label: 'Backpack' },
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
    oAuthMethods: [OAuthMethod.GOOGLE, OAuthMethod.FARCASTER],
    disableEmailLogin: false,
    disablePhoneLogin: false,
    authLayout: [AuthLayout.AUTH_FULL, AuthLayout.EXTERNAL_FULL],
    externalWallets: [ExternalWallet.METAMASK, ExternalWallet.PHANTOM],
    isWeb2AuthEnabled: true,
    isWeb3AuthEnabled: true,
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
export const CAPSULE_API_KEY: string = import.meta.env.VITE_CAPSULE_API_KEY;

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
