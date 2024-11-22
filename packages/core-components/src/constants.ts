import { Theme } from './interface.js';

export const MOBILE_SIZE = 480;

export const DEFAULT_THEME: Theme = {
  foregroundColor: '#121212',
  backgroundColor: '#FAFAFA',
};

export const COLOR_MIXES = [0, 0.04, 0.08, 0.16, 0.32, 0.48, 0.64, 0.8, 0.96];

export const UTILITY_COLORS: { red: string; yellow: string; green: string } = {
  red: 'rgba(240, 68, 56, 1)',
  yellow: 'rgba(251, 188, 4, 1)',
  green: 'rgba(52, 168, 83, 1)',
};

export const DEFAULT_Z_INDICES = {
  modalNoOverlay: 0,
  appBar: 10000,
  overlay: 10001,
  drawer: 10004,
  modal: 10005,
  popover: 10006,
};
