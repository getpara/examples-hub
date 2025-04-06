import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthMethod, WalletType, isIOS, isIOSWebview, isMobile, truncateAddress } from '@getpara/web-sdk';
import { useInternalClient } from '../hooks/utils/useInternalClient.js';
import { useStore } from '../stores/useStore.js';
import { ModalStep } from '../../modal/index.js';
import { useModalStore, useUserInfoStore } from '../../modal/stores/index.js';
import { useWalletState } from '../hooks/index.js';
import { CommonChain, CommonWallet, getExternalWalletDisplayName, TExternalWallet } from '@getpara/react-common';

export const defaultExternalWallet = {
  wallets: [],
  chains: [],
  chainId: undefined,
  wallet: undefined,
  qrUri: undefined,
  chainIdSwitchingTo: undefined,
  walletDisplayHelpers: {
    showExtension: false,
    showMobile: false,
    isSolanaMobileIOS: false,
    isCosmosMobileWallet: false,
  },
  username: undefined,
  avatar: undefined,
  connectExternalWallet: () => Promise.resolve(),
  disconnectExternalWallet: () => Promise.resolve(),
  switchChain: () => Promise.resolve(),
  setChainIdSwitchingTo: () => {},
  connectEmbeddedToExternalConnectors: () => Promise.resolve(),
  verifyWalletSignature: () => Promise.resolve({}),
};

export const ExternalWalletContext = createContext<{
  wallets: CommonWallet[];
  chains: CommonChain[];
  chainId?: string;
  wallet?: CommonWallet;
  qrUri?: string;
  chainIdSwitchingTo?: string;
  walletDisplayHelpers: {
    showExtension: boolean;
    showMobile: boolean;
    isSolanaMobileIOS: boolean;
    isCosmosMobileWallet: boolean;
  };
  username?: string;
  avatar?: string;
  connectExternalWallet: (wallet: CommonWallet, isMobile?: boolean, isManualWalletConnect?: boolean) => Promise<void>;
  disconnectExternalWallet: () => Promise<void>;
  switchChain: (chainId: string) => Promise<void>;
  setChainIdSwitchingTo: (chainId?: string) => void;
  connectEmbeddedToExternalConnectors: () => Promise<void>;
  verifyWalletSignature: () => Promise<
    | {
        address?: string;
        signature?: string;
        cosmosPublicKeyHex?: string;
        cosmosSigner?: string;
      }
    | undefined
  >;
}>(defaultExternalWallet);

export function ExternalWalletProvider({ children }: PropsWithChildren) {
  const evmContext = useStore(state => state.evmContext);
  const cosmosContext = useStore(state => state.cosmosContext);
  const solanaContext = useStore(state => state.solanaContext);
  const externalWallets = useStore(state => state.externalWallets);
  const externalWalletsWithFullAuth = useStore(state => state.externalWalletsWithFullAuth);

  const {
    wallets: evmWallets,
    disconnect: evmDisconnect,
    chains: evmChains,
    chainId: evmChainId,
    switchChain: evmSwitchChain,
    username: evmUsername,
    avatar: evmAvatar,
    connectParaEmbedded: evmConnectParaEmbedded,
    signVerificationMessage: evmSignVerificationMessage,
  } = useContext(evmContext);
  const {
    wallets: solanaWallets,
    disconnect: solanaDisconnect,
    signVerificationMessage: solanaSignVerificationMessage,
  } = useContext(solanaContext);
  const {
    wallets: cosmosWallets,
    disconnect: cosmosDisconnect,
    chains: cosmosChains,
    chainId: cosmosChainId,
    switchChain: cosmosSwitchChain,
    connectParaEmbedded: cosmosConnectParaEmbedded,
    signVerificationMessage: cosmosSignVerificationMessage,
  } = useContext(cosmosContext);
  const setStep = useModalStore(state => state.setStep);
  const setStepDirection = useModalStore(state => state.setStepDirection);
  const setIsExternalWalletConnecting = useModalStore(state => state.setIsExternalWalletConnecting);
  const isExternalWalletConnecting = useModalStore(state => state.isExternalWalletConnecting);
  const setSelectedExternalWalletId = useModalStore(state => state.setSelectedExternalWalletId);
  const selectedExternalWalletId = useModalStore(state => state.selectedExternalWalletId);
  const setExternalWalletError = useModalStore(state => state.setExternalWalletError);
  const setIsUsingMobileConnector = useModalStore(state => state.setIsUsingMobileConnector);
  const isUsingMobileConnector = useModalStore(state => state.isUsingMobileConnector);
  const setFlow = useModalStore(state => state.setFlow);
  const setSupportedAuthMethods = useModalStore(state => state.setSupportedAuthMethods);
  const setBiometricLocationHints = useModalStore(state => state.setBiometricLocationHints);
  const para = useInternalClient();
  const { setSelectedWallet } = useWalletState();
  const setAuthInfo = useUserInfoStore(state => state.setAuthInfo);

  const [qrUri, setQrUri] = useState<string>();
  const [chainIdSwitchingTo, setChainIdSwitchingTo] = useState<string>();

  // Filter any wallets that aren't included in the sort array, sort by the array then sort by installed extensions
  const wallets = [...evmWallets, ...solanaWallets, ...cosmosWallets]
    .filter(w => externalWallets.includes(w.id.toUpperCase() as TExternalWallet))
    .sort(
      (a, b) =>
        externalWallets.indexOf(a.id.toUpperCase() as TExternalWallet) -
        externalWallets.indexOf(b.id.toUpperCase() as TExternalWallet),
    )
    .sort((a, b) => (a.installed === b.installed ? 0 : a.installed ? -1 : 1));

  const wallet = useMemo(() => wallets.find(w => w.id === selectedExternalWalletId), [wallets, selectedExternalWalletId]);

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

  const chains: CommonChain[] = useMemo(() => {
    const walletType = Object.values(para.externalWallets || {})[0]?.type;

    switch (walletType) {
      case WalletType.COSMOS: {
        return cosmosChains;
      }
      case WalletType.EVM: {
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
      case WalletType.COSMOS: {
        return cosmosChainId;
      }
      case WalletType.EVM: {
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
        let resp: {
          error?: string[];
        };

        setExternalWalletError();
        setChainIdSwitchingTo(chainId);

        switch (walletType) {
          case WalletType.COSMOS: {
            setStep(ModalStep.CHAIN_SWITCH);
            resp = await cosmosSwitchChain(chainId);
            break;
          }
          case WalletType.EVM: {
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
    const walletType = Object.values(para.externalWallets)[0]?.type;

    if (walletType) {
      const resp: { address: string; signature: string; cosmosPublicKeyHex: string; cosmosSigner: string } = {
        address: '',
        signature: '',
        cosmosPublicKeyHex: '',
        cosmosSigner: '',
      };
      switch (walletType) {
        case WalletType.COSMOS: {
          const { signature, error, cosmosPublicKeyHex, cosmosSigner, address } = await cosmosSignVerificationMessage();

          if (error) {
            setExternalWalletError([error]);
          } else if (signature) {
            // If signature is returned address, cosmosPublicKeyHex and cosmosSigner will also be returned
            resp.address = address!;
            resp.signature = signature;
            resp.cosmosPublicKeyHex = cosmosPublicKeyHex!;
            resp.cosmosSigner = cosmosSigner!;
          }

          return resp;
        }
        case WalletType.EVM: {
          const { signature, error, address } = await evmSignVerificationMessage();

          if (error) {
            setExternalWalletError([error]);
          } else if (signature && address) {
            resp.address = address;
            resp.signature = signature;
          }

          return resp;
        }
        case WalletType.SOLANA: {
          const { signature, error, address } = await solanaSignVerificationMessage();

          if (error) {
            setExternalWalletError([error]);
          } else if (signature && address) {
            resp.address = address;
            resp.signature = signature;
          }

          return resp;
        }
        default: {
          return undefined;
        }
      }
    }
  }, [cosmosSignVerificationMessage, evmSignVerificationMessage, solanaSignVerificationMessage]);

  const completeFullAuth = async (
    address: string,
    type: WalletType,
    userExists: boolean,
    isVerified: boolean,
    bufferAddress?: string,
  ) => {
    setAuthInfo({
      displayName: getExternalWalletDisplayName({
        address,
        type,
      }),
      externalWalletAddress: bufferAddress ?? address,
    });

    if (userExists && isVerified) {
      // Check for supportedAuthMethods before initiating the login to ensure the user has biometrics
      const supportedAuthMethods = await para.supportedAuthMethods({
        externalWalletAddress: bufferAddress ?? address,
      });

      // If no biometrics have been set, reverify and create a biometric
      if (!supportedAuthMethods.size) {
        setFlow('signup');
        setStep(ModalStep.EXTERNAL_WALLET_VERIFICATION);
        return;
      }

      await para.initiateUserLoginV2({
        externalWalletAddress: bufferAddress ?? address,
      });

      const biometricLocationHints = supportedAuthMethods.has(AuthMethod.PASSKEY)
        ? await para.getUserBiometricLocationHints()
        : [];

      setFlow('login');
      setStep(ModalStep.BIOMETRIC_LOGIN);
      setSupportedAuthMethods(supportedAuthMethods);
      setBiometricLocationHints(biometricLocationHints);
    } else {
      setFlow('signup');
      setStep(ModalStep.EXTERNAL_WALLET_VERIFICATION);
    }
  };

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

        const { address, bufferAddress, error, userExists, isVerified } = await (isMobileConnect
          ? wallet.connectMobile(isManualWalletConnect)
          : wallet.connect());

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
          if (externalWalletsWithFullAuth?.includes(wallet.id.toUpperCase() as TExternalWallet)) {
            await completeFullAuth(address, wallet.type as WalletType, userExists, isVerified, bufferAddress);
          } else {
            setStep(ModalStep.LOGIN_DONE);
          }
        }
        setIsExternalWalletConnecting(false);
      }
    },
    [isExternalWalletConnecting, externalWalletsWithFullAuth],
  );

  const disconnectExternalWallet = async () => {
    await para.logout();
    await evmDisconnect();
    await cosmosDisconnect();
    setSelectedExternalWalletId();
    // Do Solana disconnect last so window refresh happens last
    await solanaDisconnect();
  };

  const walletDisplayHelpers = {
    // Show the extension screen if on web and the wallet is an extension and installed or the wallet isn't a mobile wallet
    // Also show the extension connection if on desktop for a solana wallet (no walletConnect)
    showExtension:
      !isMobile() && ((wallet?.isExtension && wallet?.installed) || !wallet?.isMobile || wallet?.type === WalletType.SOLANA),
    // Show the mobile screen if on mobile and the wallet is a mobile wallet or if on desktop and the wallet isn't installed
    showMobile: (isMobile() && wallet?.isMobile) || (!isMobile() && !wallet?.installed),

    isSolanaMobileIOS: isIOS() && isMobile() && !isIOSWebview() && wallet?.type === WalletType.SOLANA,
    isCosmosMobileWallet: wallet?.type === WalletType.COSMOS && !!isUsingMobileConnector,
  };

  const username: string | undefined = useMemo(() => {
    let username: string | undefined;
    const storedExternalWallet = Object.values(para.externalWallets || {})[0];

    if (storedExternalWallet) {
      const walletType = storedExternalWallet?.type;
      switch (walletType) {
        case WalletType.EVM: {
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
        case WalletType.EVM: {
          return evmAvatar;
        }
        default: {
          return undefined;
        }
      }
    }
  }, [evmAvatar, wallet]);

  const connectEmbeddedToExternalConnectors = useCallback(async () => {
    try {
      const { error } = await evmConnectParaEmbedded();
      if (error) {
        console.warn('Failed to connect Para EVM wallet to Wagmi:', error);
      } else {
        const wallet = para.findWallet(undefined, undefined, { type: [WalletType.EVM] });
        if (wallet) {
          setSelectedWallet({ id: wallet.id, type: WalletType.EVM });
        }
      }
    } catch (err) {
      console.warn('Error calling connectParaEvmWallet:', err);
    }
    try {
      const { error } = await cosmosConnectParaEmbedded();
      if (error) {
        console.warn('Failed to connect Para Cosmos wallet to Graz:', error);
      } else {
        const wallet = para.findWallet(undefined, undefined, { type: [WalletType.COSMOS] });
        if (wallet) {
          setSelectedWallet({ id: wallet.id, type: WalletType.COSMOS });
        }
      }
    } catch (err) {
      console.warn('Error calling connectParaCosmosWallet:', err);
    }
  }, [evmConnectParaEmbedded, cosmosConnectParaEmbedded]);

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
          verifyWalletSignature,
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
          verifyWalletSignature,
        ],
      )}
    >
      {children}
    </ExternalWalletContext.Provider>
  );
}

export const useExternalWallets = () => useContext(ExternalWalletContext);
