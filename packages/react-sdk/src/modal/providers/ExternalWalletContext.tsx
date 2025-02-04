import { Context, ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CommonChain, CommonWallet } from '../types/commonTypes.js';
import { EvmExternalWalletContextType } from './EvmExternalWalletContextStub.js';
import { useModalStore } from '../stores/index.js';
import { ModalStep } from '../utils/steps.js';
import { TExternalWallet } from '../types/externalWallets.js';
import { SolanaExternalWalletContextType } from './SolanaExternalWalletContextStub.js';
import { CosmosExternalWalletContextType } from './CosmosExternalWalletContextStub.js';
import { WalletType, isIOS, isIOSWebview, isMobile, truncateAddress } from '@getpara/web-sdk';
import { useInternalClient } from '../../provider/hooks/utils/useInternalClient.js';

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
  connectExternalWallet: () => {},
  disconnectExternalWallet: () => Promise.resolve(),
  switchChain: () => Promise.resolve(),
  setChainIdSwitchingTo: () => {},
};

export const ExternalWalletContext = createContext<{
  wallets: CommonWallet[];
  chains: CommonChain[];
  chainId: string;
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
  connectExternalWallet: (wallet: CommonWallet, isMobile?: boolean, isManualWalletConnect?: boolean) => void;
  disconnectExternalWallet: () => Promise<void>;
  switchChain: (chainId: string) => Promise<void>;
  setChainIdSwitchingTo: (chainId?: string) => void;
}>(defaultExternalWallet);

interface ExternalWalletProviderProps {
  children: ReactNode;
  walletSort: TExternalWallet[];
  evmContext: Context<EvmExternalWalletContextType>;
  solanaContext: Context<SolanaExternalWalletContextType>;
  cosmosContext: Context<CosmosExternalWalletContextType>;
}

export function ExternalWalletProvider({
  children,
  evmContext,
  solanaContext,
  cosmosContext,
  walletSort,
}: ExternalWalletProviderProps) {
  const {
    wallets: evmWallets,
    disconnect: evmDisconnect,
    chains: evmChains,
    chainId: evmChainId,
    switchChain: evmSwitchChain,
    username: evmUsername,
    avatar: evmAvatar,
  } = useContext(evmContext);
  const { wallets: solanaWallets, disconnect: solanaDisconnect } = useContext(solanaContext);
  const {
    wallets: cosmosWallets,
    disconnect: cosmosDisconnect,
    chains: cosmosChains,
    chainId: cosmosChainId,
    switchChain: cosmosSwitchChain,
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
  const para = useInternalClient();

  const [qrUri, setQrUri] = useState<string>();
  const [chainIdSwitchingTo, setChainIdSwitchingTo] = useState<string>();

  // Filter any wallets that aren't included in the sort array, sort by the array then sort by installed extensions
  const wallets = [...evmWallets, ...solanaWallets, ...cosmosWallets]
    .filter(w => walletSort.includes(w.id.toUpperCase() as TExternalWallet))
    .sort(
      (a, b) =>
        walletSort.indexOf(a.id.toUpperCase() as TExternalWallet) -
        walletSort.indexOf(b.id.toUpperCase() as TExternalWallet),
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
    const walletType = para.externalWallets[para.currentExternalWalletAddresses?.[0] ?? '']?.type;

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

  const chainId: string = useMemo(() => {
    const walletType = para.externalWallets[para.currentExternalWalletAddresses?.[0] ?? '']?.type;

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
      const walletType = para.externalWallets[para.currentExternalWalletAddresses?.[0] ?? '']?.type;

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

        const { address, error } = await (isMobileConnect ? wallet.connectMobile(isManualWalletConnect) : wallet.connect());

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
          setStep(ModalStep.LOGIN_DONE);
        }
        setIsExternalWalletConnecting(false);
      }
    },
    [isExternalWalletConnecting],
  );

  const disconnectExternalWallet = async () => {
    await evmDisconnect();
    await solanaDisconnect();
    await cosmosDisconnect();
    setSelectedExternalWalletId();
  };

  const walletDisplayHelpers = {
    // Show the extension screen if on web and the wallet is an extension and installed or the wallet isn't a mobile wallet
    // Also show the extension connection if on desktop for a solana wallet (no walletConnect)
    showExtension:
      !isMobile() && ((wallet?.isExtension && wallet?.installed) || !wallet?.isMobile || wallet?.type === WalletType.SOLANA),
    // Show the mobile screen if on mobile and the wallet is a mobile wallet or if on desktop and the wallet isn't installed
    showMobile: (isMobile() && wallet?.isMobile) || (!isMobile() && !wallet?.installed),

    isSolanaMobileIOS: isIOS() && isMobile() && !isIOSWebview() && wallet?.type === WalletType.SOLANA,
    isCosmosMobileWallet: wallet?.type === WalletType.COSMOS && isUsingMobileConnector,
  };

  const username: string = useMemo(() => {
    let username: string;
    const storedExternalWallet = para.externalWallets[para.currentExternalWalletAddresses?.[0] ?? ''];

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
          username = storedExternalWallet.address
            ? truncateAddress(storedExternalWallet.address, storedExternalWallet.type)
            : undefined;
          break;
        }
      }
    }
    return username;
  }, [evmUsername, wallet]);

  const avatar: string | undefined = useMemo(() => {
    const walletType = para.externalWallets[para.currentExternalWalletAddresses?.[0] ?? '']?.type;

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
        ],
      )}
    >
      {children}
    </ExternalWalletContext.Provider>
  );
}

export const useExternalWallets = () => useContext(ExternalWalletContext);
