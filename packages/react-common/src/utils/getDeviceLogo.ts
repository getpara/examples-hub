import { IconType } from '@getpara/react-components';

export const getDeviceLogo = (vendor?: string, isMobile?: boolean): IconType => {
  switch (vendor?.toLowerCase()) {
    case 'apple': {
      return 'apple';
    }
    case 'samsung': {
      return 'samsung';
    }
    case 'lenovo': {
      return 'lenovo';
    }
    case 'lg': {
      return 'lg';
    }
    case 'motorola': {
      return 'motorola';
    }
    case 'dell': {
      return 'dell';
    }
    case 'hp': {
      return 'hp';
    }
    default: {
      if (isMobile) {
        return 'phone';
      }
      return 'laptop';
    }
  }
};
