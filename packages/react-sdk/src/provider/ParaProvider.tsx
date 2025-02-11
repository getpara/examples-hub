import { useEffect } from 'react';
import { useStore } from './stores/useStore.js';
import { useAutoSessionKeepAlive } from './hooks/utils/useAutoSessionKeepAlive.js';
import { useEventListeners } from './hooks/utils/useEventListeners.js';
import { ParaProviderConfig, ParaProviderProps } from './types/provider.js';
import { ParaInternal } from '@getpara/react-common';

const DEFAULT_CONFIG: ParaProviderConfig = { disableAutoSessionKeepAlive: false };

export const ParaProvider = ({ children, paraClientConfig, callbacks, config = DEFAULT_CONFIG }: ParaProviderProps) => {
  useEventListeners(callbacks);
  useAutoSessionKeepAlive({ disabled: config.disableAutoSessionKeepAlive });

  const setClient = useStore(state => state.setClient);

  useEffect(() => {
    const newClient =
      (config.paraClientOverride as ParaInternal) ??
      new ParaInternal(paraClientConfig.env, paraClientConfig.apiKey, paraClientConfig.opts);

    setClient(newClient);
  }, [paraClientConfig, config.paraClientOverride]);

  return children;
};
