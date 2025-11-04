import SettingsStore from '@/store/SettingsStore';
import { createWeb3Wallet, web3wallet } from '@/utils/WalletConnectUtil';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSnapshot } from 'valtio';

export default function useInitialization() {
  const [initialized, setInitialized] = useState(false);
  const prevRelayerURLValue = useRef<string>('');

  const { relayerRegionURL } = useSnapshot(SettingsStore.state);

  const onInitialize = useCallback(async () => {
    try {
      await createWeb3Wallet(relayerRegionURL);
      setInitialized(true);
    } catch (err: unknown) {
      alert(err);
    }
  }, [relayerRegionURL]);

  // restart transport if relayer region changes
  const onRelayerRegionChange = useCallback(() => {
    try {
      web3wallet.core.relayer.restartTransport(relayerRegionURL);
      prevRelayerURLValue.current = relayerRegionURL;
    } catch (err: unknown) {
      alert(err);
    }
  }, [relayerRegionURL]);

  useEffect(() => {
    if (!initialized) {
      onInitialize();
    }
    if (prevRelayerURLValue.current !== relayerRegionURL) {
      onRelayerRegionChange();
    }
  }, [initialized, onInitialize, relayerRegionURL, onRelayerRegionChange]);

  return initialized;
}
