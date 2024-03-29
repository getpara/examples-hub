import { Branding } from '../types/branding';

export const darkThemeBranding: Branding = {
  colors: {
    modal: {
      surface: {
        main: '#000000',
        footer: '#121212',
      },
      border: '#121212',
    },
    tileButton: {
      surface: {
        default: '#000000',
        hover: '#121212',
      },
      border: '#121212',
    },
    input: {
      surface: {
        disabled: '#000000',
        default: '#000000',
      },
      border: {
        placeholder: '#1F1F1F',
        active: '#808080',
        error: '#F04438',
      },
    },
    primaryButton: {
      surface: {
        default: '#E0E0E0',
        hover: '#C0C0C0',
        pressed: '#FAFAFA',
        disabled: '#3F3F3F',
      },
      border: {
        default: '#C0C0C0',
        disabled: '#3F3F3F',
      },
      outline: '#3F3F3F',
    },
    secondaryButton: {
      surface: {
        default: '#121212',
        hover: '#1F1F1F',
        pressed: '#3F3F3F',
        disabled: '#3F3F3F',
      },
      border: {
        default: '#1F1F1F',
        disabled: '#3F3F3F',
      },
      outline: '#C0C0C0',
    },
    divider: '#1F1F1F',
    text: {
      primary: '#FAFAFA',
      secondary: '#616161',
      subtle: '#3F3F3F',
      inverted: '#121212',
      error: '#F04438',
    },
    background: {
      primary: '#000000',
      subtle: '#121212',
    },
    foreground: {
      primary: '#FAFAFA',
      secondary: '#C0C0C0',
      ternary: '#808080',
      quarternary: '#3F3F3F',
      quinary: '#121212',
      senary: '#121212',
    },
  },
};
