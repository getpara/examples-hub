import { IconType } from '@usecapsule/react-components';
import { AuthLayout, CapsuleModalProps, OAuthMethod, ExternalWallet as SDKExternalWallet } from '@usecapsule/react-sdk';

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
    NonNullable<CapsuleModalProps['theme']>,
    'foregroundColor' | 'backgroundColor' | 'accentColor' | 'font' | 'borderRadius'
  >;
  logo?: CapsuleModalProps['logo'];
}

export interface NetworksConfig extends Pick<CapsuleModalProps, 'networks'> {}

export interface AuthenticationConfig
  extends Pick<
    CapsuleModalProps,
    'oAuthMethods' | 'disableEmailLogin' | 'disablePhoneLogin' | 'authLayout' | 'externalWallets'
  > {
  isWeb2AuthEnabled: boolean;
  isWeb3AuthEnabled: boolean;
}

export interface SecurityConfig extends Pick<CapsuleModalProps, 'twoFactorAuthEnabled' | 'recoverySecretStepEnabled'> {}

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
}

export interface SegmentItem {
  icon: IconType;
  label: string;
  value: string;
}
