import { Icons } from './assets/icons';
import { Images } from './assets/images';

export type PredefinedColors = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';

// From: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
export type AutocompleteTypes =
  | 'on'
  | 'off'
  | 'name'
  | 'honorific-prefix'
  | 'given-name'
  | 'additional-name'
  | 'family-name'
  | 'honorific-suffix'
  | 'nickname'
  | 'email'
  | 'username'
  | 'new-password'
  | 'current-password'
  | 'one-time-code'
  | 'organization-title'
  | 'organization'
  | 'street-address'
  | 'address-line1'
  | 'address-line2'
  | 'address-line3'
  | 'address-level4'
  | 'address-level3'
  | 'address-level2'
  | 'address-level1'
  | 'country'
  | 'country-name'
  | 'postal-code'
  | 'cc-name'
  | 'cc-given-name'
  | 'cc-additional-name'
  | 'cc-family-name'
  | 'cc-family-name'
  | 'cc-number'
  | 'cc-exp'
  | 'cc-exp-month'
  | 'cc-exp-year'
  | 'cc-csc'
  | 'cc-type'
  | 'transaction-currency'
  | 'transaction-amount'
  | 'language'
  | 'bday'
  | 'bday-day'
  | 'bday-month'
  | 'bday-year'
  | 'sex'
  | 'tel'
  | 'tel-country-code'
  | 'tel-national'
  | 'tel-area-code'
  | 'tel-local'
  | 'tel-extension'
  | 'impp'
  | 'url'
  | 'photo';

export type TextFieldTypes = 'date' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url' | 'time' | 'week' | 'month' | 'datetime-local';

export type LiteralUnion<T extends U, U = string> = T | (U & Record<never, never>);

export type Color = LiteralUnion<PredefinedColors, string>;

export type CssClassMap = { [className: string]: boolean };

export type IconType = keyof typeof Icons;

export type ImageType = keyof typeof Images;

export type Theme = {
  foregroundColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  darkForegroundColor?: string;
  darkBackgroundColor?: string;
  darkAccentColor?: string;
  mode?: 'light' | 'dark';
  borderRadius?: BorderRadius;
  font?: string;
  customPalette?: CustomPalette;
  customFontSizes?: CustomFontSizes;
  customBorderRadii?: CustomBorderRadii;
};

export type BorderRadius = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface CustomBorderRadii {
  input?: string;
  select?: string;
  fileSelect?: string;
  alert?: string;
  tabs?: string;
  primaryButton?: string;
  secondaryButton?: string;
  destructiveButton?: string;
  tileButton?: string;
  modal?: string;
  pill?: string;
  qrCode?: string;
  infoBox?: string;
  tableContainer?: string;
  switch?: string;
  checkbox?: string;
  radio?: string;
  avatar?: string;
  card?: string;
  buttonGroup?: string;
}
export interface CustomFontSizes {
  body2XS?: string;
  bodyXS?: string;
  bodyS?: string;
  bodyM?: string;
  bodyL?: string;
  bodyXL?: string;
  headingXS?: string;
  headingS?: string;
  headingM?: string;
  headingL?: string;
  headingXL?: string;
  heading2XL?: string;
}

export interface CustomPalette {
  text?: {
    primary?: string;
    secondary?: string;
    subtle?: string;
    inverted?: string;
    error?: string;
  };
  modal?: {
    surface?: {
      main?: string;
      footer?: string;
    };
    border?: string;
  };
  input?: {
    surface?: {
      disabled?: string;
      default?: string;
      hover?: string;
    };
    border?: {
      placeholder?: string;
      active?: string;
      error?: string;
    };
  };
  select?: {
    surface?: {
      disabled?: string;
      default?: string;
      hover?: string;
    };
    border?: {
      placeholder?: string;
      active?: string;
      error?: string;
    };
    dropdown?: {
      border?: string;
    };
  };
  file?: {
    surface?: {
      disabled?: string;
      default?: string;
      drag?: string;
    };
    border?: {
      placeholder?: string;
      error?: string;
    };
  };
  tileButton?: {
    surface?: {
      default?: string;
      hover?: string;
      pressed?: string;
    };
    border?: string;
  };
  primaryButton?: {
    surface?: {
      default?: string;
      hover?: string;
      pressed?: string;
      disabled?: string;
    };
    border?: {
      default?: string;
      disabled?: string;
    };
    outline?: string;
  };
  secondaryButton?: {
    surface?: {
      default?: string;
      hover?: string;
      pressed?: string;
      disabled?: string;
    };
    border?: {
      default?: string;
      disabled?: string;
    };
    outline?: string;
  };
  destructiveButton?: {
    surface?: {
      default?: string;
      hover?: string;
      pressed?: string;
      disabled?: string;
    };
    border?: {
      default?: string;
      disabled?: string;
    };
    outline?: string;
  };
  divider?: string;
  spinner?: {
    path?: string;
    circle?: string;
  };
  pill?: {
    text?: string;
    container?: {
      background?: string;
      border?: string;
    };
  };
  progressIndicator?: {
    active?: string;
    next?: string;
    previous?: string;
  };
  qr?: {
    fill?: string;
    background?: string;
    border?: string;
  };
  slideButton?: {
    slider?: {
      background?: string;
      border?: string;
      text?: string;
      container?: {
        start?: {
          background?: string;
          border?: string;
        };
        end?: {
          background?: string;
          border?: string;
        };
      };
    };
    start?: {
      text?: string;
    };
    end?: {
      text?: string;
    };
  };
  alert?: {
    surface?: {
      error?: string;
    };
    border?: {
      error?: string;
    };
  };
  switch?: {
    surface?: {
      default?: string;
      checked?: string;
    };
    thumb?: {
      default?: string;
      checked?: string;
    };
  };
  checkbox?: {
    surface?: {
      default?: string;
      checked?: string;
    };
    border?: {
      default?: string;
      checked?: string;
    };
    icon?: string;
  };
  radio?: {
    surface?: {
      default?: string;
      checked?: string;
    };
    border?: {
      default?: string;
      checked?: string;
    };
  };
  card?: {
    surface?: string;
    border?: string;
  };
  iconGroup?: {
    surface?: string;
    border?: string;
    icon?: {
      default?: string;
      disabled?: string;
    };
  };
}

export interface InteractionCallback {
  eventName: string;
  callback: (ev: any) => void;
}
