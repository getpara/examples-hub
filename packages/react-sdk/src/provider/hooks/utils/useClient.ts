import ParaWeb from '@getpara/web-sdk';
import { useStore } from '../../stores/useStore.js';

/**
 * Hook for retrieving the Para client
 */
export const useClient = (): ParaWeb | undefined => {
  const client = useStore(state => state.client);

  return client as ParaWeb;
};
