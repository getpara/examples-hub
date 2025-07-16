// DO NOT EXPORT THIS FROM THE INDEX!

import { ParaInternal } from '@getpara/react-common';
import { useClient } from './useClient.js';

/**
 * Hook for retrieving the Para internal client
 */
export const useInternalClient = () => {
  const client = useClient<ParaInternal>();

  return client!;
};
