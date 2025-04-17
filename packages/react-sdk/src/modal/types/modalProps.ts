import ParaWeb, { CurrentWalletIds, TOAuthMethod } from '@getpara/web-sdk';
import { Theme } from '@getpara/react-components';
import { OnModalStepChangeValue } from '../stores/index.js';
import { ModalStep, ModalStepProp } from '../utils/steps.js';

export type ParaModalHandle = {
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

export type ParaModalTheme = Theme & {
  oAuthLogoVariant?: OAuthLogoVariantType;
};

export enum AuthLayout {
  AUTH_FULL = 'AUTH:FULL',
  AUTH_CONDENSED = 'AUTH:CONDENSED',
  EXTERNAL_FULL = 'EXTERNAL:FULL',
  EXTERNAL_CONDENSED = 'EXTERNAL:CONDENSED',
}

export type TAuthLayout = `${AuthLayout}`;

export interface ParaModalProps {
  /**
   * Your ParaWeb instance.
   */
  para?: ParaWeb;
  /**
   * Whether or not the modal is open.
   */
  isOpen?: boolean;
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
  oAuthMethods?: TOAuthMethod[];
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
  theme?: ParaModalTheme;
  /**
   * Logo to be shown throughout the modal.
   */
  logo?: string;
  /**
   * Whether or not to run configured on-ramp providers in test mode.
   */
  onRampTestMode?: boolean;
  /**
   * Whether to display information about on-chain wallets and use related terminology in the Para Modal.
   */
  hideWallets?: boolean;
  currentStepOverride?: ModalStepProp | undefined;
  /**
   * Whether or not to display just the modal without the overlay component.
   * Useful for rendering the modal inside a custom component
   * Defaults to `false`
   */
  bareModal?: boolean;
  /**
   * Whether or not to use the embedded modal styling
   * This is typically only used internally by Para and may result in unwanted styling!
   */
  embeddedModal?: boolean;
  className?: string;
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
  onClose?: () => void;
  loginTransitionOverride?: (para: ParaWeb) => Promise<void>;
  createWalletOverride?: (para: ParaWeb) => Promise<{ recoverySecret?: string; walletIds: CurrentWalletIds }>;
}
