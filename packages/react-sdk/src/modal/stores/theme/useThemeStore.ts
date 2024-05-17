import { create } from 'zustand';
import { getActions } from './actions.js';

interface ThemeState {
  isDark?: boolean;
  logo?: string;
  appName?: string;
  bareModal?: boolean;
}

export interface ThemeActions {
  updateState: (state: Partial<ThemeState>) => void;
  getLogo: () => string | undefined;
}

export type ThemeStore = ThemeState & ThemeActions;

const DEFAULT_THEME: ThemeState = {
  isDark: false,
  logo: undefined,
  appName: undefined,
  bareModal: false,
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  ...DEFAULT_THEME,
  ...getActions(set, get),
}));
