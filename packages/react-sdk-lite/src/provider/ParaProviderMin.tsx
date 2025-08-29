import { forwardRef, useEffect, useState } from 'react';
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
import { EXTERNAL_WALLET_TYPES } from '@getpara/web-sdk';
import { AuthProvider } from './providers/AuthProvider.js';
import { AccountLinkProvider } from './providers/AccountLinkProvider.js';

export const ParaProviderMin = forwardRef<
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
  const setIncludeWalletVerification = useStore(state => state.setIncludeWalletVerification);
  const includeWalletVerification = useStore(state => state.includeWalletVerification);
  const setConnectionOnly = useStore(state => state.setConnectionOnly);
  const connectionOnly = useStore(state => state.connectionOnly);
  const setModalConfig = useStore(state => state.setModalConfig);
  const modalConfig = useStore(state => state.modalConfig);
  const setAppName = useStore(state => state.setAppName);
  const appName = useStore(state => state.appName);
  const setFarcasterMiniAppConfig = useStore(state => state.setFarcasterMiniAppConfig);
  const farcasterMiniAppConfig = useStore(state => state.farcasterMiniAppConfig);
  const rpcUrl = useStore(state => state.rpcUrl);
  const setRpcUrl = useStore(state => state.setRpcUrl);
  const setProviderProps = useStore(state => state.setProviderProps);

  const [isClientReady, setIsClientReady] = useState(client?.isReady);

  useEffect(() => {
    setProviderProps({
      ...config,
      ...externalWalletConfig,
      ...paraModalConfig,
      // Redacting walletConnect to avoid exposing project id
      walletConnect: undefined,
    });
  }, [config, externalWalletConfig, paraModalConfig]);

  useEffect(() => {
    if (rpcUrl !== config.rpcUrl) setRpcUrl(config.rpcUrl);
  }, [config.rpcUrl]);

  useEffect(() => {
    if (appName !== config.appName) setAppName(config.appName);
  }, [config.appName]);

  useEffect(() => {
    if (farcasterMiniAppConfig !== config.farcasterMiniAppConfig) {
      setFarcasterMiniAppConfig(config.farcasterMiniAppConfig);
    }
  }, [config.farcasterMiniAppConfig]);

  useEffect(() => {
    if (modalConfig !== paraModalConfig) setModalConfig(paraModalConfig);
  }, [paraModalConfig]);

  useEffect(() => {
    if (connectionOnly !== externalWalletConfig?.connectionOnly) {
      setConnectionOnly(externalWalletConfig?.connectionOnly ?? false);
    }
  }, [externalWalletConfig?.connectionOnly]);

  useEffect(() => {
    if (includeWalletVerification !== externalWalletConfig?.includeWalletVerification) {
      if (
        externalWalletConfig?.connectionOnly ||
        (isParaWeb(paraClientConfig)
          ? paraClientConfig.externalWalletConnectionOnly
          : paraClientConfig.opts?.externalWalletConnectionOnly)
      ) {
        console.warn('includeWalletVerification has no effect when using connection only external wallets');
        setIncludeWalletVerification(false);
      } else {
        setIncludeWalletVerification(externalWalletConfig?.includeWalletVerification ?? false);
      }
    }
  }, [externalWalletConfig?.includeWalletVerification]);

  useEffect(() => {
    if (externalWallets !== externalWalletConfig?.wallets) {
      setExternalWallets(externalWalletConfig?.wallets ?? [...EXTERNAL_WALLET_TYPES]);
    }
  }, [externalWalletConfig?.wallets]);

  useEffect(() => {
    if (externalWalletsWithFullAuth !== externalWalletConfig?.createLinkedEmbeddedForExternalWallets) {
      if (
        externalWalletConfig?.connectionOnly ||
        (isParaWeb(paraClientConfig)
          ? paraClientConfig.externalWalletConnectionOnly
          : paraClientConfig.opts?.externalWalletConnectionOnly)
      ) {
        console.warn('createLinkedEmbeddedForExternalWallets has no effect when using connection only external wallets');
        setExternalWalletsWithFullAuth([]);
      } else {
        setExternalWalletsWithFullAuth(externalWalletConfig?.createLinkedEmbeddedForExternalWallets ?? []);
      }
    }
  }, [externalWalletConfig?.createLinkedEmbeddedForExternalWallets]);

  useEffect(() => {
    if (!isConfigType(paraClientConfig) && !isParaWeb(paraClientConfig)) {
      throw new Error('Invalid Para config');
    }

    const newClient = isParaWeb(paraClientConfig)
      ? paraClientConfig
      : new ParaWeb(paraClientConfig.env, paraClientConfig.apiKey, paraClientConfig.opts);

    if (newClient.isReady) {
      setIsClientReady(true);
    } else {
      setIsClientReady(false);
    }

    setClient(newClient);
  }, [paraClientConfig]);

  useEffect(() => {
    if (client && !client.isReady) {
      client
        .ready()
        .then(() => {
          setIsClientReady(true);
        })
        .catch(err => {
          setIsClientReady(false);
          console.error('Error initializing Para client:', err);
        });
    }
  }, [client]);

  if (!client || !isClientReady) {
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
        <AccountLinkProvider>
          {children}
          {!config.disableEmbeddedModal && client.isReady && <ParaModal ref={ref} />}
        </AccountLinkProvider>
      </ExternalWalletWrapper>
    </AuthProvider>
  );
});
