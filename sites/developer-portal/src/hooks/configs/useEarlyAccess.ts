import { ConfigResult, useConfig } from 'statsig-react';
import { EarlyAccess } from '../../types/earlyAccess';

export const useEarlyAccess = () => {
  const { config }: ConfigResult = useConfig('early_access');

  const earlyAccessItems = config.get<EarlyAccess[]>('items', []);

  return { earlyAccessItems };
};
