import { OAuthMethod, Wallet, WalletType } from "@getpara/react-native-wallet";
import { SlotProps } from "input-otp-native";

export type InputType = "" | "email" | "phone";

export interface SmartInputProps {
  inputType: InputType;
  onInputTypeChange: (type: InputType) => void;
  onSubmit: () => void;
  placeholder?: string;
  label?: string;
  email?: string;
  onEmailChange?: (value: string) => void;
  phoneNumber?: string;
  countryCode?: string;
  onPhoneNumberChange?: (value: string) => void;
  onCountryCodeChange?: (value: string) => void;
}

export interface OAuthProviderInfo {
  name: string;
  logo: any;
}

export interface OAuthProvidersProps {
  onSelect(provider: OAuthMethod): void;
}

export interface AuthNavigationParams {
  inputType: InputType;
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
}

export type AuthNavigationParamsWithBiometrics = AuthNavigationParams & {
  biometricsId: string;
};

export interface CustomOTPInputProps {
  maxLength?: number;
  onComplete: (code: string) => void;
  onClear?: () => void;
  slotClassName?: string;
  activeSlotClassName?: string;
  slotSize?: number;
  slotTextClassName?: string;
  caretColor?: string;
  caretHeight?: number;
  caretWidth?: number;
  gap?: number;
  autoComplete?: boolean;
}
export interface SlotComponentProps extends SlotProps {
  slotClassName?: string;
  activeSlotClassName?: string;
  slotSize?: number;
  slotTextClassName?: string;
  caretColor?: string;
  caretHeight?: number;
  caretWidth?: number;
}

export interface FakeCaretProps {
  color?: string;
  height?: number;
  width?: number;
}

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
