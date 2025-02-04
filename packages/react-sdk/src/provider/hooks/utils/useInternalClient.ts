// DO NOT EXPORT THIS FROM THE INDEX!

import { ParaInternal } from '@getpara/react-common';
import { useStore } from '../../stores/useStore.js';

/**
 * Hook for retrieving the Para internal client
 */
export const useInternalClient = () => {
  const client = useStore(state => state.client);

  return client as ParaInternal;
};
