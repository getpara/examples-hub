import { create } from 'zustand';
import { getActions } from './actions.js';
import { AuthLayout, OAuthLogoVariantType, TAuthLayout } from '../../types/modalProps.js';

interface ThemeState {
  isDark?: boolean;
  logo?: string;
  appName?: string;
  bareModal?: boolean;
  embeddedModal?: boolean;
  oAuthLogoVariant?: OAuthLogoVariantType;
  authLayout?: TAuthLayout[];
}

export interface ThemeActions {
  updateState: (state: Partial<ThemeState>) => void;
  getLogo: () => string | undefined;
  setAuthLayout: (authLayout: TAuthLayout[]) => void;
}

export type ThemeStore = ThemeState & ThemeActions;

const DEFAULT_THEME: ThemeState = {
  isDark: false,
  logo: undefined,
  appName: undefined,
  bareModal: false,
  embeddedModal: false,
  oAuthLogoVariant: undefined,
  authLayout: [AuthLayout.AUTH_FULL, AuthLayout.EXTERNAL_FULL],
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  ...DEFAULT_THEME,
  ...getActions(set, get),
}));
