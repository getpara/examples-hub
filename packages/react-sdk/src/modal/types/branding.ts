export interface Branding {
  colors?: {
    modal?: {
      surface?: {
        main?: string;
        footer?: string;
      };
      border?: string;
    };
    tileButton?: {
      surface?: {
        default?: string;
        hover?: string;
      };
      border?: string;
    };
    input?: {
      surface?: {
        disabled?: string;
        default?: string;
      };
      border?: {
        placeholder?: string;
        active?: string;
        error?: string;
      };
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
    divider?: string;
    text?: {
      primary?: string;
      secondary?: string;
      subtle?: string;
      inverted?: string;
      error?: string;
    };
    background?: {
      primary?: string;
      subtle?: string;
    };
    foreground?: {
      primary?: string;
      secondary?: string;
      ternary?: string;
      quarternary?: string;
      quinary?: string;
      senary?: string;
    };
    alert?: {
      surface?: {
        error?: string;
      };
      border?: {
        error?: string;
      };
    };
  };
  borderRadii?: {
    input?: number;
    alert?: number;
    primaryButton?: number;
    secondaryButton?: number;
    tileButton?: number;
    modal?: number;
    pill?: number;
    qrCode?: number;
    infoBox?: number;
  };
  font?: string;
}
