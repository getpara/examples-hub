import { Theme } from '../../interface';
import { getCssBorderRadii } from './utils';

export const generateBorderRadii = ({ borderRadius, customBorderRadii }: Pick<Theme, 'borderRadius' | 'customBorderRadii'>) => {
  let mediumRadius: number,
    largeRadius: number,
    checkboxRadius: number = 4;
  const fullRadius = 1000;
  let isFull = false;
  let isNone = false;

  switch (borderRadius) {
    case 'none': {
      isNone = true;
      mediumRadius = 0;
      largeRadius = 0;
      checkboxRadius = 0;
      break;
    }
    case 'xs': {
      mediumRadius = 2;
      largeRadius = 4;
      checkboxRadius = 2;
      break;
    }
    case 'sm': {
      mediumRadius = 4;
      largeRadius = 8;
      break;
    }
    case 'md': {
      mediumRadius = 8;
      largeRadius = 16;
      break;
    }
    case 'xl': {
      mediumRadius = 16;
      largeRadius = 32;
      break;
    }
    case 'full': {
      mediumRadius = 24;
      largeRadius = 32;
      isFull = true;
      break;
    }
    default:
    case 'lg': {
      mediumRadius = 12;
      largeRadius = 24;
      break;
    }
  }

  document.documentElement.style.setProperty('--cpsl-border-radius-input', `${isFull ? fullRadius : mediumRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-select', `${isFull ? fullRadius : mediumRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-file', `${isFull ? fullRadius : mediumRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-alert', `${isFull ? fullRadius : mediumRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-tabs', `${isNone ? 0 : fullRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-primary-button', `${isFull ? fullRadius : mediumRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-secondary-button', `${isFull ? fullRadius : mediumRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-tertiary-button', `${isFull ? fullRadius : mediumRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-destructive-button', `${isFull ? fullRadius : mediumRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-tile-button', `${mediumRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-qr-code', `${largeRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-info-box', `${mediumRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-table-container', `${mediumRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-avatar', `${mediumRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-button-group', `${mediumRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-card', `${largeRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-modal', `${largeRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-checkbox', `${checkboxRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-switch', `${isNone ? 0 : fullRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-pill', `${isNone ? 0 : fullRadius}px`);
  document.documentElement.style.setProperty('--cpsl-border-radius-radio', `${fullRadius}px`);

  if (customBorderRadii) {
    const cssBorderRadiiVars = getCssBorderRadii(customBorderRadii);
    Object.entries(cssBorderRadiiVars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }
};
