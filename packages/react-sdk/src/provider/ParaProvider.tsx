import { forwardRef, useEffect } from 'react';
import { useStore } from './stores/useStore.js';
import { useAutoSessionKeepAlive } from './hooks/utils/useAutoSessionKeepAlive.js';
import { useEventListeners } from './hooks/utils/useEventListeners.js';
import { ParaProviderProps } from './types/provider.js';
import { Chain, Transport } from 'viem';
import { ExternalWalletWrapper } from './components/ExternalWalletWrapper.js';
import { ParaModal } from '../modal/ParaModal.js';
import { ParaModalHandle } from '../modal/index.js';
import { isConfigType, isParaWeb } from './utils/paraConfigTypeGuards.js';
import ParaWeb from '@getpara/web-sdk';
import { ExternalWallet } from '@getpara/react-common';
import { AuthProvider } from './providers/AuthProvider.js';

export const ParaProvider = forwardRef<
  ParaModalHandle,
  ParaProviderProps<readonly [Chain, ...Chain[]], Record<[Chain, ...Chain[]][number]['id'], Transport>>
>(({ children, paraClientConfig, callbacks, config, externalWalletConfig, paraModalConfig }, ref) => {
  useEventListeners(callbacks);
  useAutoSessionKeepAlive({ disabled: config.disableAutoSessionKeepAlive });

  const setClient = useStore(state => state.setClient);
  const client = useStore(state => state.client);
  const setExternalWallets = useStore(state => state.setExternalWallets);
  const externalWallets = useStore(state => state.externalWallets);
  const setExternalWalletsWithFullAuth = useStore(state => state.setExternalWalletsWithFullAuth);
  const externalWalletsWithFullAuth = useStore(state => state.externalWalletsWithFullAuth);
  const setModalConfig = useStore(state => state.setModalConfig);
  const modalConfig = useStore(state => state.modalConfig);
  const setAppName = useStore(state => state.setAppName);
  const appName = useStore(state => state.appName);
  const rpcUrl = useStore(state => state.rpcUrl);
  const setRpcUrl = useStore(state => state.setRpcUrl);

  useEffect(() => {
    if (rpcUrl !== config.rpcUrl) setRpcUrl(config.rpcUrl);
  }, [config.rpcUrl]);

  useEffect(() => {
    if (appName !== config.appName) setAppName(config.appName);
  }, [config.appName]);

  useEffect(() => {
    if (modalConfig !== paraModalConfig) setModalConfig(paraModalConfig);
  }, [paraModalConfig]);

  useEffect(() => {
    if (externalWallets !== externalWalletConfig?.wallets) {
      setExternalWallets(externalWalletConfig?.wallets ?? Object.values(ExternalWallet));
    }
  }, [externalWalletConfig?.wallets]);

  useEffect(() => {
    if (externalWalletsWithFullAuth !== externalWalletConfig?.walletsWithParaAuth) {
      if (
        isConfigType(paraClientConfig)
          ? paraClientConfig.opts?.externalWalletConnectionOnly
          : paraClientConfig.externalWalletConnectionOnly
      ) {
        console.warn('walletsWithParaAuth has no effect when using externalWalletConnectionOnly');
        setExternalWalletsWithFullAuth([]);
      } else {
        setExternalWalletsWithFullAuth(externalWalletConfig?.walletsWithParaAuth ?? []);
      }
    }
  }, [externalWalletConfig?.walletsWithParaAuth]);

  useEffect(() => {
    if (!isConfigType(paraClientConfig) && !isParaWeb(paraClientConfig)) {
      throw new Error('Invalid Para config');
    }

    const newClient = isConfigType(paraClientConfig)
      ? new ParaWeb(paraClientConfig.env, paraClientConfig.apiKey, paraClientConfig.opts)
      : paraClientConfig;

    setClient(newClient);
  }, [paraClientConfig]);

  if (!client) {
    return null;
  }

  return (
    <AuthProvider
      is2faEnabled={paraModalConfig?.twoFactorAuthEnabled}
      isRecoverySecretStepEnabled={paraModalConfig?.recoverySecretStepEnabled}
      overrides={{
        login: paraModalConfig?.loginTransitionOverride,
        createWallets: paraModalConfig?.createWalletOverride,
      }}
    >
      <ExternalWalletWrapper config={externalWalletConfig}>
        {children}
        {!config.disableEmbeddedModal && <ParaModal ref={ref} />}
      </ExternalWalletWrapper>
    </AuthProvider>
  );
});
