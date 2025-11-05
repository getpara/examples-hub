import {
  ModalBuilderConfig,
  AppearanceConfig,
  AuthenticationConfig,
  SecurityConfig,
  WalletsConfig,
  OnRampsConfig,
  TAuthLayout,
} from '../types';
import { TExternalWallet, TOAuthMethod } from '@getpara/react-sdk';

const VALID_OAUTH_METHODS: TOAuthMethod[] = ['GOOGLE', 'TWITTER', 'DISCORD', 'FARCASTER', 'FACEBOOK', 'APPLE', 'TELEGRAM'];
const VALID_EXTERNAL_WALLETS: TExternalWallet[] = [
  'METAMASK',
  'RAINBOW',
  'COINBASE',
  'WALLETCONNECT',
  'ZERION',
  'RABBY',
  'SAFE',
  'OKX',
  'PHANTOM',
  'GLOW',
  'BACKPACK',
  'SOLFLARE',
  'LEAP',
  'KEPLR',
  'COSMOSTATION',
  'HAHA',
  'VALORA',
];
const VALID_AUTH_LAYOUTS: TAuthLayout[] = ['AUTH:FULL', 'AUTH:CONDENSED', 'EXTERNAL:FULL', 'EXTERNAL:CONDENSED'];

function isValidColor(color: string | undefined): boolean {
  if (!color) return true;
  return /^#[0-9A-Fa-f]{6}$/.test(color) || /^rgb\(/.test(color) || /^rgba\(/.test(color);
}

function isValidBoolean(value: any): boolean {
  return typeof value === 'boolean';
}

function isValidString(value: any): boolean {
  return typeof value === 'string';
}

function isValidArray(value: any, validator: (item: any) => boolean): boolean {
  return Array.isArray(value) && value.every(validator);
}

export function validateConfigDiff(diff: Partial<ModalBuilderConfig>): Partial<ModalBuilderConfig> | null {
  try {
    const validated: Partial<ModalBuilderConfig> = {};

    // Validate appearance
    if (diff.appearance) {
      const validatedAppearance: Partial<AppearanceConfig> = {};

      if (diff.appearance.theme) {
        const validatedTheme: Partial<AppearanceConfig['theme']> = {};

        if (diff.appearance.theme.foregroundColor && isValidColor(diff.appearance.theme.foregroundColor)) {
          validatedTheme.foregroundColor = diff.appearance.theme.foregroundColor;
        }
        if (diff.appearance.theme.backgroundColor && isValidColor(diff.appearance.theme.backgroundColor)) {
          validatedTheme.backgroundColor = diff.appearance.theme.backgroundColor;
        }
        if (diff.appearance.theme.accentColor && isValidColor(diff.appearance.theme.accentColor)) {
          validatedTheme.accentColor = diff.appearance.theme.accentColor;
        }
        if (diff.appearance.theme.font && isValidString(diff.appearance.theme.font)) {
          validatedTheme.font = diff.appearance.theme.font;
        }
        if (diff.appearance.theme.borderRadius && isValidString(diff.appearance.theme.borderRadius)) {
          validatedTheme.borderRadius = diff.appearance.theme.borderRadius;
        }

        if (Object.keys(validatedTheme).length > 0) {
          validatedAppearance.theme = validatedTheme;
        }
      }

      if (diff.appearance.logo !== undefined && isValidString(diff.appearance.logo)) {
        validatedAppearance.logo = diff.appearance.logo;
      }

      if (Object.keys(validatedAppearance).length > 0) {
        validated.appearance = validatedAppearance as AppearanceConfig;
      }
    }

    // Validate authentication
    if (diff.authentication) {
      const validatedAuth: Partial<AuthenticationConfig> = {};

      if (
        diff.authentication.oAuthMethods &&
        isValidArray(diff.authentication.oAuthMethods, (m: any) => VALID_OAUTH_METHODS.includes(m))
      ) {
        validatedAuth.oAuthMethods = diff.authentication.oAuthMethods;
      }
      if (
        diff.authentication.externalWallets &&
        isValidArray(diff.authentication.externalWallets, (w: any) => VALID_EXTERNAL_WALLETS.includes(w))
      ) {
        validatedAuth.externalWallets = diff.authentication.externalWallets;
      }
      if (
        diff.authentication.authLayout &&
        isValidArray(diff.authentication.authLayout, (l: any) => VALID_AUTH_LAYOUTS.includes(l))
      ) {
        validatedAuth.authLayout = diff.authentication.authLayout;
      }
      if (diff.authentication.disableEmailLogin !== undefined && isValidBoolean(diff.authentication.disableEmailLogin)) {
        validatedAuth.disableEmailLogin = diff.authentication.disableEmailLogin;
      }
      if (diff.authentication.disablePhoneLogin !== undefined && isValidBoolean(diff.authentication.disablePhoneLogin)) {
        validatedAuth.disablePhoneLogin = diff.authentication.disablePhoneLogin;
      }
      if (diff.authentication.isWeb2AuthEnabled !== undefined && isValidBoolean(diff.authentication.isWeb2AuthEnabled)) {
        validatedAuth.isWeb2AuthEnabled = diff.authentication.isWeb2AuthEnabled;
      }
      if (diff.authentication.isWeb3AuthEnabled !== undefined && isValidBoolean(diff.authentication.isWeb3AuthEnabled)) {
        validatedAuth.isWeb3AuthEnabled = diff.authentication.isWeb3AuthEnabled;
      }
      if (diff.authentication.isGuestModeEnabled !== undefined && isValidBoolean(diff.authentication.isGuestModeEnabled)) {
        validatedAuth.isGuestModeEnabled = diff.authentication.isGuestModeEnabled;
      }

      if (Object.keys(validatedAuth).length > 0) {
        validated.authentication = validatedAuth as AuthenticationConfig;
      }
    }

    // Validate security
    if (diff.security) {
      const validatedSecurity: Partial<SecurityConfig> = {};

      if (diff.security.twoFactorAuthEnabled !== undefined && isValidBoolean(diff.security.twoFactorAuthEnabled)) {
        validatedSecurity.twoFactorAuthEnabled = diff.security.twoFactorAuthEnabled;
      }
      if (diff.security.recoverySecretStepEnabled !== undefined && isValidBoolean(diff.security.recoverySecretStepEnabled)) {
        validatedSecurity.recoverySecretStepEnabled = diff.security.recoverySecretStepEnabled;
      }

      if (Object.keys(validatedSecurity).length > 0) {
        validated.security = validatedSecurity as SecurityConfig;
      }
    }

    // Validate wallets
    if (diff.wallets) {
      const validatedWallets: Partial<WalletsConfig> = {};

      if (diff.wallets.hideWallets !== undefined && isValidBoolean(diff.wallets.hideWallets)) {
        validatedWallets.hideWallets = diff.wallets.hideWallets;
      }

      if (Object.keys(validatedWallets).length > 0) {
        validated.wallets = validatedWallets as WalletsConfig;
      }
    }

    // Validate onRamps
    if (diff.onRamps) {
      const validatedOnRamps: Partial<OnRampsConfig> = {};

      if (diff.onRamps.onRampTestMode !== undefined && isValidBoolean(diff.onRamps.onRampTestMode)) {
        validatedOnRamps.onRampTestMode = diff.onRamps.onRampTestMode;
      }

      if (Object.keys(validatedOnRamps).length > 0) {
        validated.onRamps = validatedOnRamps as OnRampsConfig;
      }
    }

    // Return validated config or null if empty
    return Object.keys(validated).length > 0 ? validated : null;
  } catch {
    // If validation fails, return null
    return null;
  }
}
