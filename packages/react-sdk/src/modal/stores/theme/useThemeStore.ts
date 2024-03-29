import { create } from 'zustand';
import { getActions } from './actions';
import { Theme } from '../../types/theme';
import { DEFAULTS } from '../../constants/defaults';

interface ThemeState {
  theme: Theme;
  logo?: string;
  logoDark?: string;
  appName?: string;
}

export interface ThemeActions {
  updateState: (state: Partial<ThemeState>) => void;
  getLogo: () => string | undefined;
}

export type ThemeStore = ThemeState & ThemeActions;

const DEFAULT_THEME: ThemeState = {
  theme: DEFAULTS.THEME,
  logo: undefined,
  logoDark: undefined,
  appName: undefined,
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  ...DEFAULT_THEME,
  ...getActions(set, get),
}));
