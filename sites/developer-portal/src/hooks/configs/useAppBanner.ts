import { ConfigResult, useConfig } from 'statsig-react';

export const useAppBanner = () => {
  const { config }: ConfigResult = useConfig('app_banner');

  const bannerText: string = config.get('text', '');

  return { bannerText };
};
