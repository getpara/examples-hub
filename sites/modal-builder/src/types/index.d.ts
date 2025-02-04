import { IconType } from '@getpara/react-components';
import { AuthLayout, ParaModalProps, OAuthMethod, ExternalWallet as SDKExternalWallet } from '@getpara/react-sdk';

export type TAuthLayout = `${AuthLayout}`;

export type ViewType = 'desktop' | 'mobile' | 'code';
export type AuthSectionId = 'web2' | 'web3';

export type AuthMethod = OAuthMethod | 'email-auth' | 'phone-auth';

export type ExternalWallet = keyof typeof SDKExternalWallet;

export type ReorderableType = AuthSectionId | AuthMethod | ExternalWallet | OnRampProvider;

export interface DraggableItemHeaderConfig {
  logo: string;
  label: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface AppearanceConfig {
  theme: Pick<
    NonNullable<ParaModalProps['theme']>,
    'foregroundColor' | 'backgroundColor' | 'accentColor' | 'font' | 'borderRadius'
  >;
  logo?: ParaModalProps['logo'];
}

export interface NetworksConfig extends Pick<ParaModalProps, 'networks'> {}

export interface AuthenticationConfig
  extends Pick<
    ParaModalProps,
    'oAuthMethods' | 'disableEmailLogin' | 'disablePhoneLogin' | 'authLayout' | 'externalWallets'
  > {
  isWeb2AuthEnabled: boolean;
  isWeb3AuthEnabled: boolean;
}

export interface WalletsConfig extends Pick<ParaModalProps, 'hideWallets'> {
  hideWallets: boolean;
}

export interface SecurityConfig extends Pick<ParaModalProps, 'twoFactorAuthEnabled' | 'recoverySecretStepEnabled'> {}

export interface OnRampsConfig {
  onRampTestMode: boolean;
}

export interface OffRampsConfig {}

export interface DepositCryptoConfig {}

export interface ModalBuilderConfig {
  appearance: AppearanceConfig;
  networks: NetworksConfig;
  authentication: AuthenticationConfig;
  security: SecurityConfig;
  onRamps: OnRampsConfig;
  offRamps: OffRampsConfig;
  depositCrypto: DepositCryptoConfig;
  wallets: WalletsConfig;
}

export interface SegmentItem {
  icon: IconType;
  label: string;
  value: string;
}
