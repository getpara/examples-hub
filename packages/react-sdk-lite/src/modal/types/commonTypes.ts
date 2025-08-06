import { IconType } from '@getpara/react-components';

export type Tab<T> = { label: string; value: T; icon: IconType };

export type DisplayMetadata = {
  name: string;
  inlineText?: string;
  icon: IconType;
  iconBranded?: IconType;
  isDark?: boolean;
  isCircular?: boolean;
};
