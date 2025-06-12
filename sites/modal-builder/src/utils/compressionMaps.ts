import { ExternalWallet, Network, OnRampProvider } from '@getpara/react-sdk';

export const KEY_MAP: Record<string, string> = {
  appearance: 'a',
  networks: 'n',
  authentication: 'auth',
  security: 's',
  onRamps: 'or',
  offRamps: 'ofr',
  depositCrypto: 'dc',
  wallets: 'w',
  theme: 't',
  foregroundColor: 'fc',
  backgroundColor: 'bc',
  accentColor: 'ac',
  font: 'f',
  borderRadius: 'br',
  logo: 'l',
  oAuthMethods: 'om',
  disableEmailLogin: 'del',
  disablePhoneLogin: 'dpl',
  authLayout: 'al',
  externalWallets: 'ew',
  isWeb2AuthEnabled: 'w2',
  isWeb3AuthEnabled: 'w3',
  isGuestModeEnabled: 'gm',
  twoFactorAuthEnabled: '2fa',
  recoverySecretStepEnabled: 'rs',
  onRampTestMode: 'tm',
  hideWallets: 'hw',
};

export const REVERSE_KEY_MAP = Object.fromEntries(Object.entries(KEY_MAP).map(([k, v]) => [v, k])) as Record<string, string>;

export const VALUE_MAPS: Record<string, Record<string | number, string>> = {
  networks: {
    [Network.ETHEREUM]: 'e',
    [Network.SOLANA]: 's',
    [Network.COSMOS]: 'c',
    [Network.POLYGON]: 'p',
    [Network.ARBITRUM]: 'a',
    [Network.BASE]: 'b',
    [Network.OPTIMISM]: 'o',
  },
  externalWallets: {
    [ExternalWallet.METAMASK]: 'mm',
    [ExternalWallet.RAINBOW]: 'rb',
    [ExternalWallet.COINBASE]: 'cb',
    [ExternalWallet.WALLETCONNECT]: 'wc',
    [ExternalWallet.ZERION]: 'zr',
    [ExternalWallet.RABBY]: 'ry',
    [ExternalWallet.SAFE]: 'sf',
    [ExternalWallet.OKX]: 'ox',
    [ExternalWallet.PHANTOM]: 'ph',
    [ExternalWallet.GLOW]: 'gl',
    [ExternalWallet.BACKPACK]: 'bp',
    [ExternalWallet.SOLFLARE]: 'sl',
    [ExternalWallet.LEAP]: 'lp',
    [ExternalWallet.KEPLR]: 'kp',
  },
  oAuthMethods: {
    GOOGLE: 'g',
    TWITTER: 't',
    DISCORD: 'd',
    FARCASTER: 'f',
    FACEBOOK: 'fb',
    APPLE: 'a',
    TELEGRAM: 'tg',
  },
  authLayout: {
    'AUTH:FULL': 'af',
    'AUTH:BUTTON': 'ab',
    'EXTERNAL:FULL': 'ef',
    'EXTERNAL:BUTTON': 'eb',
  },
  onRampProviders: {
    [OnRampProvider.STRIPE]: 'st',
    [OnRampProvider.RAMP]: 'rp',
    [OnRampProvider.MOONPAY]: 'mp',
  },
};

export const REVERSE_VALUE_MAPS = Object.fromEntries(
  Object.entries(VALUE_MAPS).map(([category, map]) => [
    category,
    Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k])),
  ]),
) as Record<string, Record<string, string>>;
