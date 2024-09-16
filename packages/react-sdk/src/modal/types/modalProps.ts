import CapsuleWeb, { CurrentWalletIds, OAuthMethod, OnRampConfig, NetworkProp } from '@usecapsule/web-sdk';
import { Theme } from '@usecapsule/react-components';
import { OnModalStepChangeValue } from '../stores/index.js';
import { ModalStep, ModalStepProp } from '../utils/steps.js';
import { TExternalWallet } from './externalWallets.js';

export type CapsuleModalHandle = {
  /**
   * Move the modal backward
   */
  goBack: () => void;
  /**
   * Returns if the modal can go back
   */
  canGoBack: () => boolean;
  /**
   * Returns if the modal is expanded
   */
  currentStep: () => ModalStep;
  /**
   * Trigger the modal close handler
   */
  handleModalClose: () => void;
};

export type OAuthLogoVariantType = 'dark' | 'light' | 'default';

export type CapsuleModalTheme = Theme & {
  oAuthLogoVariant?: OAuthLogoVariantType;
};

export enum AuthLayout {
  AUTH_FULL = 'AUTH:FULL',
  AUTH_CONDENSED = 'AUTH:CONDENSED',
  EXTERNAL_FULL = 'EXTERNAL:FULL',
  EXTERNAL_CONDENSED = 'EXTERNAL:CONDENSED',
}

export type TAuthLayout = `${AuthLayout}`;

export interface CapsuleModalProps {
  /**
   * Your CapsuleWeb instance.
   */
  capsule: CapsuleWeb;
  /**
   * Whether or not the modal is open.
   */
  isOpen: boolean;
  /**
   * Whether or not to show two-factor authentication steps to users.
   * Defaults to `false`.
   */
  twoFactorAuthEnabled?: boolean;
  /**
   * Whether or not to show the wallet recovery to users.
   * Defaults to `false`
   */
  recoverySecretStepEnabled?: boolean;
  /**
   * Which OAuth methods (if any) to show.
   * Defaults to `true`.
   */
  oAuthMethods?: OAuthMethod[];
  /**
   * Whether or not to allow for email login. If true, only OAuth login will be available.
   * Defaults to `false`.
   */
  disableEmailLogin?: boolean;
  /**
   * Whether or not to allow for phone login. If true, only OAuth login will be available.
   * Defaults to `false`.
   */
  disablePhoneLogin?: boolean;
  /**
   * Theming to be used throughout the modal.
   */
  theme?: CapsuleModalTheme;
  /**
   * Logo to be shown throughout the modal.
   */
  logo?: string;
  /**
   * App name to be shown throughout the modal.
   */
  appName?: string;
  /**
   * Configure on-ramp providers to allow users to add funds upon signing up.
   */
  onRampConfig?: OnRampConfig;
  /**
   * Configures which EVM networks your app supports, an array of one or more of `["ETHEREUM", "ARBITRUM", "BASE", "OPTIMISM", and "POLYGON"]`.
   * Defaults to `["ETHEREUM"]`.
   */
  networks?: NetworkProp[];
  currentStepOverride?: ModalStepProp | undefined;
  /**
   * Whether or not to display just the modal without the overlay component.
   * Useful for rendering the modal inside a custom component
   * Defaults to `false`
   */
  bareModal?: boolean;
  className?: string;
  /**
   * Which external wallets to support.
   */
  externalWallets?: TExternalWallet[];
  /**
   * How the modal should order the components on the main auth screen.
   * Only the first method of each type (auth or external) will be used.
   * Default to [AuthLayout.AUTH_FULL, AuthLayout.EXTERNAL_FULL]
   */
  authLayout?: TAuthLayout[];
  /**
   * Called when the modal step changes
   */
  onModalStepChange?: (value: OnModalStepChangeValue) => void;
  /**
   * Called when the modal is closed
   */
  onClose: () => void;
  loginTransitionOverride?: (capsule: CapsuleWeb) => Promise<void>;
  createWalletOverride?: (capsule: CapsuleWeb) => Promise<{ recoverySecret?: string; walletIds: CurrentWalletIds }>;
}
