import CapsuleWeb, { OAuthMethod } from '@usecapsule/web-sdk';
import { Theme } from './theme';
import { Branding } from './branding';

export interface CapsuleModalV2Props {
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
   * Which OAuth methods (if any) to show.
   * Defaults to `true`.
   */
  oAuthMethods?: OAuthMethod[];
  /**
   * Theme to be used throughout the modal. Affects which default branding is used and what OAuth logos are used.
   * Defaults to the light.
   */
  theme?: Theme;
  /**
   * Branding to customize the modal.
   * Defaults to the Capsule branding.
   */
  branding?: Branding;
  /**
   * Logo to be shown throughout the modal.
   * Defaults to the Capsule logo.
   */
  logo?: string;
  /**
   * Optional logo to be shown when the modal is in dark theme.
   */
  logoDark?: string;
  appName?: string;
  onRampCurrency?: string;
  onRampAvailable?: boolean;
  rampNetworkApiKey?: string;
  currentStepOverride?: string | undefined;
  onClose: () => void;
  loginTransitionOverride?: (capsule: CapsuleWeb) => Promise<void>;
  createWalletOverride?: (capsule: CapsuleWeb) => Promise<string>;
}
