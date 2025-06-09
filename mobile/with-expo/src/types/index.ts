import { OAuthMethod, Wallet, WalletType } from "@getpara/react-native-wallet";

export type AuthType = "email" | "phone";

export type EmailAuth = { authType: "email"; email: string };
export type PhoneAuth = { authType: "phone"; phone: string; countryCode: string };
export type AuthCreds = EmailAuth | PhoneAuth;

export interface AuthNavigationParams {
  authType: AuthType;
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
}

export type PreserveTypes<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] : string;
};

export type AuthNavigationParamsWithBiometrics = AuthNavigationParams & {
  biometricsId: string;
};

export interface CountryCodeDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export interface CountryOption {
  dialCode: string;
  name: string;
  isoCode: string;
}

export enum STORAGE_KEYS {
  USER_EMAIL = "userEmail",
  USER_PHONE = "userPhone",
  USER_COUNTRY_CODE = "userCountryCode",
}

export enum SetupStep {
  INITIALIZING = "initializing",
  REGISTERING_PASSKEY = "registering_passkey",
  CREATING_WALLET = "creating_wallet",
  PASSKEY_ERROR = "passkey_error",
  WALLET_ERROR = "wallet_error",
  SUCCESS = "success",
}

export interface WalletBalance {
  amount: string;
  symbol: string;
  decimals: number;
}

export interface WalletWithBalance extends Wallet {
  balance: WalletBalance | null;
  isLoadingBalance: boolean;
}

export type WalletsWithBalances = Record<WalletType, WalletWithBalance[]>;

export interface SocialLoginProviderInfo {
  name: string;
  logo: any;
}
export type SocialLoginProvidersMap = Partial<Record<OAuthMethod, SocialLoginProviderInfo>>;

export const SUPPORTED_WALLET_TYPES = [WalletType.EVM, WalletType.SOLANA] as const;
export type SupportedWalletType = (typeof SUPPORTED_WALLET_TYPES)[number];
export type WalletsBySupportedType = {
  [K in SupportedWalletType]: Wallet[];
};
