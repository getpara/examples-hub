import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isMobile, truncateAddress, TWalletType } from '@getpara/web-sdk';
import { useInternalClient } from '../hooks/utils/useInternalClient.js';
import { useStore } from '../stores/useStore.js';
import { ModalStep } from '../../modal/index.js';
import { useModalStore } from '../../modal/stores/index.js';
import { useAccount, useParaStatus, useVerifyExternalWallet, useWalletState } from '../hooks/index.js';
import {
  BalanceManagement,
  ChainManagement,
  CommonChain,
  CommonWallet,
  ExternalWalletContextType,
  TExternalWallet,
} from '@getpara/react-common';
import {
  COSMOS_WALLETS,
  EVM_WALLETS,
  ExternalWalletInfo,
  SOLANA_WALLETS,
  VerifyExternalWalletParams,
} from '@getpara/web-sdk';
import { useAuthActions } from './AuthProvider.js';
import { CosmosSignResult } from '@getpara/cosmos-wallet-connectors';

export const useWalletDisplayHelpers = (wallet: CommonWallet | undefined) => {
  const isUsingMobileConnector = useModalStore(state => state.isUsingMobileConnector);

  return {
    // Show the extension screen if on web and the wallet is an extension and installed or the wallet isn't a mobile wallet
    // Also show the extension connection if on desktop for a solana wallet (no walletConnect)
    showExtension:
      !isMobile() && ((wallet?.isExtension && wallet?.installed) || !wallet?.isMobile || wallet?.type === 'SOLANA'),
    // Show the mobile screen if on mobile and the wallet is a mobile wallet or if on desktop and the wallet isn't installed
    showMobile: (isMobile() && wallet?.isMobile) || (!isMobile() && !wallet?.installed),

    isCosmosMobileWallet: wallet?.type === 'COSMOS' && !!isUsingMobileConnector,
  };
};

export const defaultExternalWallet = {
  wallets: [],
  chains: [],
  chainId: undefined,
  wallet: undefined,
  qrUri: undefined,
  chainIdSwitchingTo: undefined,
  walletDisplayHelpers: { showExtension: false, showMobile: false, isCosmosMobileWallet: false },
  username: undefined,
  avatar: undefined,
  connectExternalWallet: () => Promise.resolve(),
  disconnectExternalWallet: () => Promise.resolve(),
  switchChain: () => Promise.resolve(),
  setChainIdSwitchingTo: () => {},
  connectEmbeddedToExternalConnectors: () => Promise.resolve(),
  verifyWalletSignature: () => Promise.resolve({} as unknown as any),
  signMessage: () => Promise.resolve({} as unknown as any),
  isSigningMessage: false,
  getWalletBalance: () => Promise.resolve(undefined),
  requestInfo: (_: TExternalWallet) => Promise.resolve({} as ExternalWalletInfo),
  disconnectBase: (_: TExternalWallet) => Promise.resolve(),
  connectFarcasterMiniApp: () => Promise.resolve(),
};

type Value = Omit<ExternalWalletContextType<CosmosSignResult>, 'disconnect' | 'signVerificationMessage' | 'requestInfo'> &
  ChainManagement<string, void> &
  BalanceManagement & {
    wallet?: CommonWallet;
    qrUri?: string;
    chainIdSwitchingTo?: string;
    walletDisplayHelpers: {
      showExtension: boolean;
      showMobile: boolean;
      isCosmosMobileWallet: boolean;
    };
    username?: string;
    avatar?: string;
    connectExternalWallet: (wallet: CommonWallet, isMobile?: boolean, isManualWalletConnect?: boolean) => Promise<void>;
    disconnectExternalWallet: () => Promise<void>;
    setChainIdSwitchingTo: (chainId?: string) => void;
    connectEmbeddedToExternalConnectors: () => Promise<void>;
    isSigningMessage: boolean;
    verifyWalletSignature: () => Promise<VerifyExternalWalletParams | undefined>;
    requestInfo: (_: TExternalWallet, __: TWalletType) => Promise<ExternalWalletInfo>;
    connectFarcasterMiniApp: () => Promise<void>;
  };

export const ExternalWalletContext = createContext<Value>(defaultExternalWallet);

export function ExternalWalletProvider({ children }: PropsWithChildren) {
  const { isReady, isFarcasterMiniApp } = useParaStatus();
  const { isConnected } = useAccount();
  const farcasterMiniAppConfig = useStore(state => state.farcasterMiniAppConfig);
  const evmContext = useStore(state => state.evmContext);
  const cosmosContext = useStore(state => state.cosmosContext);
  const solanaContext = useStore(state => state.solanaContext);
  const externalWallets = useStore(state => state.externalWallets);
  const externalWalletsWithFullAuth = useStore(state => state.externalWalletsWithFullAuth);
  const includeWalletVerification = useStore(state => state.includeWalletVerification);
  const connectionOnly = useStore(state => state.connectionOnly);

  const {
    wallets: evmWallets,
    disconnect: evmDisconnect,
    chains: evmChains,
    chainId: evmChainId,
    switchChain: evmSwitchChain,
    username: evmUsername,
    avatar: evmAvatar,
    connectParaEmbedded: evmConnectParaEmbedded,
    signMessage: evmSignMessage,
    signVerificationMessage: evmSignVerificationMessage,
    getWalletBalance: evmGetWalletBalance,
    requestInfo: evmRequestInfo,
    disconnectBase: evmDisconnectBase,
    farcasterStatus: evmFarcasterStatus,
  } = useContext(evmContext);
  const {
    wallets: solanaWallets,
    disconnect: solanaDisconnect,
    signMessage: solanaSignMessage,
    signVerificationMessage: solanaSignVerificationMessage,
    requestInfo: solanaRequestInfo,
    disconnectBase: solanaDisconnectBase,
  } = useContext(solanaContext);
  const {
    wallets: cosmosWallets,
    disconnect: cosmosDisconnect,
    chains: cosmosChains,
    chainId: cosmosChainId,
    switchChain: cosmosSwitchChain,
    connectParaEmbedded: cosmosConnectParaEmbedded,
    signMessage: cosmosSignMessage,
    signVerificationMessage: cosmosSignVerificationMessage,
    requestInfo: cosmosRequestInfo,
    disconnectBase: cosmosDisconnectBase,
  } = useContext(cosmosContext);
  const onLoginRef = useStore(state => state.onLoginRef);
  const setStep = useModalStore(state => state.setStep);
  const setStepDirection = useModalStore(state => state.setStepDirection);
  const setIsExternalWalletConnecting = useModalStore(state => state.setIsExternalWalletConnecting);
  const isExternalWalletConnecting = useModalStore(state => state.isExternalWalletConnecting);
  const setSelectedExternalWalletId = useModalStore(state => state.setSelectedExternalWalletId);
  const selectedExternalWalletId = useModalStore(state => state.selectedExternalWalletId);
  const setExternalWalletError = useModalStore(state => state.setExternalWalletError);
  const setIsUsingMobileConnector = useModalStore(state => state.setIsUsingMobileConnector);
  const refs = useModalStore(state => state.refs);
  const para = useInternalClient();
  const { setSelectedWallet } = useWalletState();
  const { onNewAuthState } = useAuthActions();
  const { mutateAsync: verifyExternalWallet } = useVerifyExternalWallet();

  const [qrUri, setQrUri] = useState<string>();
  const [chainIdSwitchingTo, setChainIdSwitchingTo] = useState<string>();
  const [isSigningMessage, setIsSigningMessage] = useState(false);

  // Filter any wallets that aren't included in the sort array, sort by the array then sort by installed extensions
  const wallets = [...evmWallets, ...solanaWallets, ...cosmosWallets]
    .filter(
      w =>
        (w.internalId !== 'FARCASTER' || para?.isFarcasterMiniApp) &&
        externalWallets.includes(w.id.toUpperCase() as TExternalWallet),
    )
    .sort(
      (a, b) =>
        externalWallets.indexOf(a.id.toUpperCase() as TExternalWallet) -
        externalWallets.indexOf(b.id.toUpperCase() as TExternalWallet),
    )
    .sort((a, b) => (a.installed === b.installed ? 0 : a.installed ? -1 : 1));

  const wallet = useMemo(
    () => wallets.find(w => w.internalId === selectedExternalWalletId),
    [wallets, selectedExternalWalletId],
  );

  const updateQrUri = async () => {
    const uri = await wallet?.getQrUri?.();

    setQrUri(uri);
  };

  useEffect(() => {
    if (wallet) {
      if (!qrUri) {
        updateQrUri();
      }
    } else if (qrUri) {
      setQrUri(undefined);
    }
  }, [wallet]);

  const getWalletBalance = useCallback(async () => {
    const walletType = Object.values(para.externalWallets || {})[0]?.type;

    switch (walletType) {
      case 'EVM': {
        return await evmGetWalletBalance();
      }
      default: {
        return undefined;
      }
    }
  }, [evmGetWalletBalance, selectedExternalWalletId]);

  const chains: CommonChain[] = useMemo(() => {
    const walletType = Object.values(para.externalWallets || {})[0]?.type;

    switch (walletType) {
      case 'COSMOS': {
        return cosmosChains;
      }
      case 'EVM': {
        return evmChains;
      }
      default: {
        return [];
      }
    }
  }, [cosmosChains, evmChains, selectedExternalWalletId]);

  const chainId: string | undefined = useMemo(() => {
    const walletType = Object.values(para.externalWallets || {})[0]?.type;

    switch (walletType) {
      case 'COSMOS': {
        return cosmosChainId;
      }
      case 'EVM': {
        return evmChainId?.toString();
      }
      default: {
        return undefined;
      }
    }
  }, [cosmosChains, evmChains, selectedExternalWalletId]);

  const switchChain = useCallback(
    async (chainId: string) => {
      const walletType = Object.values(para.externalWallets || {})[0]?.type;

      if (walletType) {
        let resp;

        setExternalWalletError();
        setChainIdSwitchingTo(chainId);

        switch (walletType) {
          case 'COSMOS': {
            setStep(ModalStep.CHAIN_SWITCH);
            resp = await cosmosSwitchChain(chainId);
            break;
          }
          case 'EVM': {
            setStep(ModalStep.CHAIN_SWITCH);
            resp = await evmSwitchChain(parseInt(chainId));
            break;
          }
          default: {
            resp = {};
            break;
          }
        }

        if (resp.error) {
          setExternalWalletError(resp.error);
        } else {
          setChainIdSwitchingTo(undefined);
          setStepDirection(-1);
          setStep(ModalStep.ACCOUNT_MAIN);
        }
      }
    },
    [evmSwitchChain, cosmosSwitchChain],
  );

  const verifyWalletSignature = useCallback(async () => {
    setExternalWalletError();
    const wallet = Object.values(para.externalWallets)[0];
    const walletType = wallet?.type;

    let verifyExternalWalletParams: VerifyExternalWalletParams | undefined;

    const withVerification = includeWalletVerification;
    const isConnectionOnly = connectionOnly;
    const withFullParaAuth = wallet?.name
      ? externalWalletsWithFullAuth.includes(wallet.name.toUpperCase() as TExternalWallet)
      : false;

    const defaultWalletInfo = {
      withVerification,
      isConnectionOnly,
      withFullParaAuth,
      provider: wallet.name,
      providerId: wallet.externalProviderId,
      isExternal: true,
    };

    switch (walletType) {
      case 'COSMOS':
        {
          const { address, signature, error, cosmosPublicKeyHex, cosmosSigner, addressBech32 } =
            await cosmosSignVerificationMessage();

          if (error) {
            setExternalWalletError([error]);
          } else if (signature && address) {
            // If signature is returned address, cosmosPublicKeyHex and cosmosSigner will also be returned
            verifyExternalWalletParams = {
              externalWallet: {
                type: 'COSMOS',
                address,
                addressBech32,
                ...defaultWalletInfo,
              },
              signedMessage: signature,
              cosmosPublicKeyHex,
              cosmosSigner,
            };
          }
        }
        break;
      case 'EVM':
        {
          const { signature, error, address } = await evmSignVerificationMessage();

          if (error) {
            setExternalWalletError([error]);
          } else if (signature && address) {
            verifyExternalWalletParams = {
              externalWallet: {
                type: 'EVM',
                address,
                ...defaultWalletInfo,
              },
              signedMessage: signature,
            };
          }
        }
        break;
      case 'SOLANA':
        {
          const { signature, error, address } = await solanaSignVerificationMessage();

          if (error) {
            setExternalWalletError([error]);
          } else if (signature && address) {
            verifyExternalWalletParams = {
              externalWallet: {
                type: 'SOLANA',
                address,
                ...defaultWalletInfo,
              },
              signedMessage: signature,
            };
          }
        }
        break;
      default:
        break;
    }

    if (!verifyExternalWalletParams?.externalWallet || !verifyExternalWalletParams?.signedMessage) {
      console.error('No signature or address found on the verifyWalletSignature response.');
      setExternalWalletError(['Signature verification failed.']);
      return;
    }

    try {
      const d = await verifyExternalWallet(verifyExternalWalletParams);
      if (wallet && externalWalletsWithFullAuth?.includes(wallet.name?.toUpperCase() as TExternalWallet)) {
        await onNewAuthState(d);
      } else {
        setStep(ModalStep.LOGIN_DONE);
      }
    } catch (e) {
      console.error('Error verifying signature:', e);
      setExternalWalletError(['Signature verification failed.']);
    }

    return verifyExternalWalletParams;
  }, [cosmosSignVerificationMessage, evmSignVerificationMessage, solanaSignVerificationMessage, wallet]);

  const signMessage = useCallback(
    async ({ message, externalWallet: _externalWallet }: { message: string; externalWallet?: ExternalWalletInfo }) => {
      setExternalWalletError();
      setIsSigningMessage(true);
      let externalWallet = _externalWallet;
      const walletType = externalWallet?.type || Object.values(para.externalWallets || {})[0]?.type;

      let response;
      try {
        switch (walletType) {
          case 'COSMOS':
            {
              const { address, signature, error, cosmosPublicKeyHex, cosmosSigner } = await cosmosSignMessage({
                message,
                externalWallet,
              });

              if (error) {
                throw new Error(error);
              } else if (signature && address) {
                // If signature is returned address, cosmosPublicKeyHex and cosmosSigner will also be returned
                response = { address, signature, cosmosPublicKeyHex, cosmosSigner };
              }
            }
            break;
          case 'EVM':
            {
              const { address, signature, error } = await evmSignMessage({ message, externalWallet });

              if (error) {
                throw new Error(error);
              } else if (signature && address) {
                response = { address, signature };
              }
            }
            break;
          case 'SOLANA':
            {
              const { signature, error, address } = await solanaSignMessage({ message });

              if (error) {
                throw new Error(error);
              } else if (signature && address) {
                // If signature is returned address, cosmosPublicKeyHex and cosmosSigner will also be returned
                response = { address, signature };
              }
            }
            break;
          default:
            break;
        }

        setIsSigningMessage(false);

        return response;
      } catch (error) {
        setIsSigningMessage(false);

        throw error;
      }
    },
    [cosmosSignMessage, evmSignMessage, solanaSignMessage],
  );

  const connectExternalWallet = useCallback(
    async (
      wallet: CommonWallet,
      isMobileConnect?: boolean,
      isManualWalletConnect?: boolean,
      isResetAfterManualWalletConnect?: boolean,
    ) => {
      // If triggering the WC modal manually from desktop, disconnect the current connection attempt to trigger the mobile connection attempt
      if (isExternalWalletConnecting && isManualWalletConnect) {
        await evmDisconnect();
        await solanaDisconnect();
        await cosmosDisconnect();
        setQrUri(undefined);
        setIsExternalWalletConnecting(false);
      }

      if (isResetAfterManualWalletConnect || isManualWalletConnect || !isExternalWalletConnecting) {
        setExternalWalletError();
        setIsExternalWalletConnecting(true);
        setIsUsingMobileConnector(isMobileConnect);

        const { address, error, authState } = await (isMobileConnect
          ? wallet.connectMobile(isManualWalletConnect, connectionOnly)
          : wallet.connect(connectionOnly));

        if (error) {
          setExternalWalletError([error]);
          setIsUsingMobileConnector();

          // If triggering the WC modal manually from desktop, attempt desktop reconnect on connection rejection
          if (isManualWalletConnect && error === 'Connection request rejected') {
            setExternalWalletError();

            await connectExternalWallet(wallet, false, false, true);
            await updateQrUri();
            return;
          }
        } else if (address) {
          if (
            !!authState &&
            (externalWalletsWithFullAuth?.includes(wallet.name.toUpperCase() as TExternalWallet) ||
              includeWalletVerification)
          ) {
            onNewAuthState(authState);
          } else {
            setStep(ModalStep.LOGIN_DONE);
          }
        }
        setIsExternalWalletConnecting(false);
      }
    },
    [isExternalWalletConnecting, externalWalletsWithFullAuth, connectionOnly, includeWalletVerification],
  );

  const connectFarcasterMiniApp = async () => {
    const evmWallet = para.supportedWalletTypes.find(({ type }) => type === 'EVM')
      ? evmWallets.find(w => w.internalId === 'FARCASTER')
      : undefined;

    if (evmWallet) {
      const isConnected = evmFarcasterStatus?.isConnected && !!evmFarcasterStatus.address;
      if (isConnected) {
        await para.loginExternalWallet({
          externalWallet: [
            {
              type: 'EVM',
              provider: 'Farcaster',
              providerId: 'FARCASTER',
              address: evmFarcasterStatus.address,
              isConnectionOnly: true,
            } as ExternalWalletInfo,
          ],
        });

        setStep(ModalStep.LOGIN_DONE);
      } else {
        await connectExternalWallet(evmWallet, false, true);
      }
    }
  };

  const requestInfo = async (providerId: TExternalWallet, type: TWalletType) => {
    switch (type) {
      case 'EVM': {
        const externalWallet = await evmRequestInfo(providerId);

        return externalWallet;
      }

      case 'SOLANA': {
        const externalWallet = await solanaRequestInfo(providerId);

        return externalWallet;
      }

      case 'COSMOS': {
        const externalWallet = await cosmosRequestInfo(providerId);

        return externalWallet;
      }
    }
  };

  const disconnectBase = async (providerId: TExternalWallet) => {
    const [isEvm, isSolana, _isCosmos] = [
      EVM_WALLETS.includes(providerId as any),
      SOLANA_WALLETS.includes(providerId as any),
      COSMOS_WALLETS.includes(providerId as any),
    ];

    switch (true) {
      case isEvm:
        await evmDisconnectBase(providerId);
        break;

      case isSolana:
        await solanaDisconnectBase(providerId);
        break;

      default: {
        await cosmosDisconnectBase();
        break;
      }
    }
  };

  const disconnectExternalWallet = async () => {
    await para.logout();
    await evmDisconnect();
    await cosmosDisconnect();
    setSelectedExternalWalletId();
    // Do Solana disconnect last so window refresh happens last
    await solanaDisconnect();
  };

  const walletDisplayHelpers = useWalletDisplayHelpers(wallet);

  const username: string | undefined = useMemo(() => {
    let username: string | undefined;
    const storedExternalWallet = Object.values(para.externalWallets || {})[0];

    if (storedExternalWallet) {
      const walletType = storedExternalWallet?.type;
      switch (walletType) {
        case 'EVM': {
          // If evmUsername is an EVM address, format it, else return it since it should be an ENS name
          username = evmUsername
            ? evmUsername.startsWith('0x')
              ? truncateAddress(evmUsername, 'EVM')
              : evmUsername
            : undefined;

          break;
        }
        default: {
          username =
            storedExternalWallet.address && storedExternalWallet.type
              ? truncateAddress(storedExternalWallet.address, storedExternalWallet.type)
              : undefined;
          break;
        }
      }
    }
    return username;
  }, [evmUsername, wallet]);

  const avatar: string | undefined = useMemo(() => {
    const walletType = Object.values(para.externalWallets || {})[0]?.type;

    if (walletType) {
      switch (walletType) {
        case 'EVM': {
          return evmAvatar;
        }
        default: {
          return undefined;
        }
      }
    }
  }, [evmAvatar, wallet]);

  const connectEmbeddedToExternalConnectors = useCallback(async () => {
    const evmWallet = para.findWallet(undefined, undefined, { type: ['EVM'] });
    const cosmosWallet = para.findWallet(undefined, undefined, { type: ['COSMOS'] });

    if (evmWallet) {
      try {
        const { error } = await evmConnectParaEmbedded();
        if (error) {
          console.warn('Failed to connect Para EVM wallet to Wagmi:', error);
        } else {
          if (evmWallet) {
            setSelectedWallet({ id: evmWallet.id, type: 'EVM' });
          }
        }
      } catch (err) {
        console.warn('Error calling connectParaEvmWallet:', err);
      }
    }
    if (cosmosWallet) {
      try {
        const { error } = await cosmosConnectParaEmbedded();
        if (error) {
          console.warn('Failed to connect Para Cosmos wallet to Graz:', error);
        } else {
          if (cosmosWallet) {
            setSelectedWallet({ id: cosmosWallet.id, type: 'COSMOS' });
          }
        }
      } catch (err) {
        console.warn('Error calling connectParaCosmosWallet:', err);
      }
    }
  }, [evmConnectParaEmbedded, cosmosConnectParaEmbedded]);

  useEffect(() => {
    onLoginRef.current = async () => {
      await connectEmbeddedToExternalConnectors();
    };
  }, [connectEmbeddedToExternalConnectors]);

  useEffect(() => {
    if (
      isReady &&
      isFarcasterMiniApp &&
      !isConnected &&
      !farcasterMiniAppConfig?.disableAutoConnect &&
      !refs.wasSignedIn.current
    ) {
      connectFarcasterMiniApp();
    }
  }, [isReady, isConnected, isFarcasterMiniApp, farcasterMiniAppConfig]);

  return (
    <ExternalWalletContext.Provider
      value={useMemo(
        () => ({
          wallets,
          chains,
          chainId,
          wallet,
          qrUri,
          walletDisplayHelpers,
          chainIdSwitchingTo,
          username,
          avatar,
          connectExternalWallet,
          disconnectExternalWallet,
          switchChain,
          setChainIdSwitchingTo,
          connectEmbeddedToExternalConnectors,
          signMessage,
          isSigningMessage,
          verifyWalletSignature,
          getWalletBalance,
          requestInfo,
          disconnectBase,
          connectFarcasterMiniApp,
        }),
        [
          wallets,
          chains,
          chainId,
          wallet,
          qrUri,
          walletDisplayHelpers,
          chainIdSwitchingTo,
          username,
          avatar,
          disconnectExternalWallet,
          connectExternalWallet,
          switchChain,
          setChainIdSwitchingTo,
          connectEmbeddedToExternalConnectors,
          signMessage,
          isSigningMessage,
          verifyWalletSignature,
          getWalletBalance,
          requestInfo,
          disconnectBase,
          connectFarcasterMiniApp,
        ],
      )}
    >
      {children}
    </ExternalWalletContext.Provider>
  );
}

export const useExternalWallets = () => useContext(ExternalWalletContext);
