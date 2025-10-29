import { PropsWithChildren, createContext, useEffect, useMemo, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Adapter, isIosAndRedirectable, WalletReadyState } from '@solana/wallet-adapter-base';
import { AuthState, ExternalWalletInfo } from '@getpara/web-sdk';
import { CreateWalletFn } from '../types/Wallet.js';
import {
  defaultSolanaExternalWallet,
  DisconnectBaseOptions,
  DisconnectType,
  ExternalWalletContextType,
  ExternalWalletProviderConfig,
  ExternalWalletProviderConfigBase,
  FarcasterMiniAppManagement,
  SignArgs,
  TExternalWallet,
  type CommonWallet,
} from '@getpara/react-common';
import bs58 from 'bs58';
import { externalHooks, TExternalHooks } from './externalHooks.js';
import { farcasterWallet } from '../wallets/connectors/index.js';
import { Chain } from '@solana-mobile/mobile-wallet-adapter-protocol';

export type SolanaExternalWalletContextType = ExternalWalletContextType & TExternalHooks & FarcasterMiniAppManagement;

export const SolanaExternalWalletContext = createContext<SolanaExternalWalletContextType>({
  ...defaultSolanaExternalWallet,
  farcasterStatus: undefined,
} as SolanaExternalWalletContextType);

export type SolanaExternalWalletProviderConfig = ExternalWalletProviderConfigBase;

type SolanaExternalWalletProviderConfigFull = ExternalWalletProviderConfig<CreateWalletFn>;

export function SolanaExternalWalletProvider({
  children,
  wallets: walletFns,
  onSwitchWallet,
  para,
  walletsWithFullAuth,
  includeWalletVerification,
  connectionOnly,
  chain,
}: SolanaExternalWalletProviderConfigFull & PropsWithChildren & { chain: Chain }) {
  const {
    wallets: adapters,
    select: selectWallet,
    disconnect,
    disconnecting,
    publicKey: solanaAddress,
    wallet,
    connecting,
    signMessage: solanaSignMessage,
  } = useWallet();

  const disconnectTypeRef = useRef<DisconnectType | undefined>();

  const solanaSignMessageRef = useRef<typeof solanaSignMessage>(solanaSignMessage);
  const solanaAddressRef = useRef<typeof solanaAddress | undefined>(solanaAddress);
  const verificationMessage = useRef<string>();

  const [isFarcasterSetup, setIsFarcasterSetup] = useState(false);

  const reset = async () => {
    await disconnect();
    await para.logout();
  };

  const login = async ({
    address,
    providerId,
    providerName,
  }: {
    address: string;
    providerId: string;
    providerName?: string;
  }) => {
    try {
      return await para.loginExternalWallet({
        externalWallet: {
          partnerId: para.partnerId,
          address,
          type: 'SOLANA',
          provider: providerName,
          providerId,
          withFullParaAuth:
            walletsWithFullAuth === 'ALL' ||
            walletsWithFullAuth?.includes((getWallet(providerName ?? '')?.id.toUpperCase() ?? '') as TExternalWallet),
          withVerification: includeWalletVerification,
          isConnectionOnly: connectionOnly,
        },
        uri: window?.location.origin,
        chainId: chain,
      });
    } catch (err) {
      await reset();

      throw 'Error logging you in. Please try again.';
    }
  };

  const switchWallet = async (address?: string) => {
    let error: string;

    // If we're calling switch wallet with no address, treat it as if the user disconnected the wallet from the app and logout to reset the Para instance.
    if (!address) {
      await para.logout();
    } else {
      if (para.isExternalWalletAuth || para.isExternalWalletWithVerification) {
        await reset();
      } else {
        try {
          await login({
            address,
            providerId: getWallet(wallet?.adapter?.name ?? '')?.id,
            providerName: wallet?.adapter?.name,
          });
        } catch (err) {
          error = err;
        }
      }
    }

    onSwitchWallet({ address, error });
  };

  useEffect(() => {
    const storedExternalWallet = para.externalWallets[solanaAddress?.toString() ?? ''];

    if (!!solanaAddress && !storedExternalWallet && !disconnectTypeRef.current) {
      reset();
    }
  }, []);

  useEffect(() => {
    solanaSignMessageRef.current = solanaSignMessage;
  }, [solanaSignMessage]);

  useEffect(() => {
    solanaAddressRef.current = solanaAddress;
  }, [solanaAddress]);

  useEffect(() => {
    const storedExternalWallet = Object.values(para.externalWallets || {})[0];

    // If the user is using an external Solana wallet we want to watch for wallet changes and log them in to a different user when the wallet changes
    if (
      !connecting &&
      (!wallet || wallet?.adapter.connected) &&
      storedExternalWallet?.type === 'SOLANA' &&
      storedExternalWallet?.address !== solanaAddress?.toString() &&
      !disconnectTypeRef.current
    ) {
      switchWallet(solanaAddress?.toString());
    }
  }, [solanaAddress, connecting, wallet]);

  const signMessage = async ({ message }: SignArgs) => {
    try {
      let solanaAddressNow = solanaAddressRef.current ?? solanaAddress,
        solanaSignMessageNow = solanaSignMessageRef.current ?? solanaSignMessage;
      while (!solanaAddressNow || !solanaSignMessageNow) {
        await new Promise(resolve => setTimeout(resolve, 100));

        solanaAddressNow = solanaAddressRef.current ?? solanaAddress;
        solanaSignMessageNow = solanaSignMessageRef.current ?? solanaSignMessage;
      }

      const encodedMessage = new TextEncoder().encode(message);
      const signature = await solanaSignMessageNow(encodedMessage);

      solanaAddressRef.current = undefined;
      solanaSignMessageRef.current = undefined;

      return {
        address: solanaAddressNow.toString(),
        signature: bs58.encode(signature),
      };
    } catch (e) {
      console.error(e);
      if (e.message.includes('User rejected the request')) {
        return { error: 'Signature request rejected' };
      }
      console.error('Solana signature error:', e.message);
      return { error: 'An unknown error occurred' };
    }
  };

  const signVerificationMessage = async () => {
    const signature = await signMessage({ message: verificationMessage.current });

    return signature;
  };

  const connectBase = async (adapter?: Adapter, _switchWallet = false): Promise<string> => {
    if (!adapter) {
      throw new Error('Adapter not found.');
    }

    const wallet = getWallet(adapter.name);

    if (wallet.getQrUri) {
      const qrUri = await wallet.getQrUri();

      window.dispatchEvent(new CustomEvent<string>('PARA_WALLETCONNECT_URI_READY', { detail: qrUri }));
    }

    // if (switchWallet) {
    selectWallet(adapter.name);
    // Using a timeout here to ensure the selectWallet function sets the wallet completely before connecting.
    // Without this there was a race condition where connect wasn't correctly listening to the adapters connect event.
    await new Promise(resolve => setTimeout(resolve, 100));
    // }

    let address: string | undefined;
    let error: string | undefined;
    try {
      await adapter.connect();

      if (adapter.publicKey) {
        address = adapter.publicKey.toString();
      } else {
        // Await the connect event before proceeding
        await new Promise<void>((resolve, reject) => {
          adapter.once('connect', async () => {
            try {
              address = adapter.publicKey.toString();
              resolve();
            } catch (err) {
              reject(err);
            }
          });

          // Optionally, listen for disconnect or error events to reject early
          adapter.once('error', (err: any) => {
            error = err?.message || 'An unknown error occurred';
            reject(err);
          });
          adapter.once('disconnect', () => {
            error = 'Disconnected before connect event';
            reject(new Error(error));
          });
        });
      }

      return address;
    } catch (e) {
      console.error(e);
      await adapter.disconnect();
      throw e;
    }
  };

  const connect = async (adapter?: Adapter): Promise<{ address?: string; error?: string; authState?: AuthState }> => {
    // If on iOS, rely on the redirect happening in the modal.
    if (isIosAndRedirectable()) {
      return;
    }

    await disconnect();

    let address: string | undefined;
    let error: string | undefined;
    let authState: AuthState | undefined;

    try {
      address = await connectBase(adapter, true);

      if (address) {
        try {
          authState = await login({ address, providerId: getWallet(adapter.name)?.id, providerName: adapter.name });
          verificationMessage.current = authState.stage === 'verify' ? authState.signatureVerificationMessage : undefined;
        } catch (err) {
          await disconnect();
          address = undefined;
          error = err;
        }
      }
    } catch (err: any) {
      switch (err.message) {
        case 'User aborted.':
        case 'Approval Denied':
        case 'You canceled this request.':
        case 'Disconnected before connect event': {
          error = 'Connection request rejected';
          break;
        }
        default: {
          console.error('Solana connection error:', err.message);
          error = 'An unknown error occurred';
          break;
        }
      }
    }
    return { address, error, authState };
  };

  const requestInfo = async (providerId: string): Promise<ExternalWalletInfo> => {
    const wallet = wallets.find(w => w.id === providerId);

    const adapter = getAdapter(wallet.name ?? '');

    disconnectTypeRef.current = 'ACCOUNT_LINKING';
    try {
      const address = await connectBase(adapter);

      const externalWallet: ExternalWalletInfo = {
        partnerId: para.partnerId,
        address,
        type: 'SOLANA',
        providerId: wallet.id,
        provider: wallet.name,
      };

      return externalWallet;
    } catch (e) {
      // await disconnectBase(providerId);
      console.error('Error linking account:', e);
      throw new Error(e?.message ?? e);
    }
  };

  const disconnectBase = async (providerId: TExternalWallet, { disconnectType }: DisconnectBaseOptions = {}) => {
    const wallet = wallets.find(w => w.id === providerId);

    if (!wallet) {
      return;
    }

    const adapter = getAdapter(wallet.name ?? '');

    if (!adapter?.connected) {
      return;
    }

    if (disconnectType) {
      disconnectTypeRef.current = disconnectType;
    }

    try {
      await adapter.disconnect();
    } catch (e) {
      console.error('Error disconnecting Solana wallet:', e);
      // Don't throw the error - just log it since this is for account linking cleanup
      // The wallet might not be properly connected or available
    } finally {
      disconnectTypeRef.current = undefined;
    }
  };

  const getAdapter = (name: string) =>
    adapters.find(a => (a.adapter.name === 'Mobile Wallet Adapter' ? a : a.adapter.name === name ? a : false))?.adapter;

  const getWallet = (name: string) => wallets.find(w => w.name === name);

  const createWallet = (walletFn: CreateWalletFn): CommonWallet => {
    const metaData = walletFn();
    const adapter = getAdapter(metaData.name);

    return {
      connect: () => connect(adapter),
      connectMobile: () => connect(adapter),
      type: 'SOLANA',
      installed:
        adapter && (adapter?.readyState === WalletReadyState.Installed || adapter?.readyState === WalletReadyState.Loadable),
      ...metaData,
      // Using name here since that's the only common id across the networks
      id: metaData.name,
    } as CommonWallet;
  };

  const [wallets, setWallets] = useState(() => walletFns.map(createWallet));

  const farcasterStatus = useMemo(() => {
    if (!isFarcasterSetup) {
      return undefined;
    }

    const farcasterAdapter = getAdapter('Farcaster');

    if (!farcasterAdapter) {
      return {
        isPresent: false as const,
      };
    }

    return farcasterAdapter.connected && farcasterAdapter.publicKey
      ? {
          isPresent: true as const,
          isConnected: true as const,
          address: farcasterAdapter.publicKey.toString(),
        }
      : {
          isPresent: true as const,
          isConnected: false as const,
        };
  }, [isFarcasterSetup, adapters]);

  useEffect(() => {
    const detectFarcaster = async () => {
      if (para.isFarcasterMiniApp) {
        try {
          // @ts-ignore
          await import('@farcaster/mini-app-solana');
        } catch (e) {}
      }
    };

    detectFarcaster();
  }, [para.isFarcasterMiniApp]);

  useEffect(() => {
    const setupFarcaster = async () => {
      const adapter = getAdapter('Farcaster');
      if (para.isFarcasterMiniApp && !wallets.some(w => w.internalId === 'FARCASTER') && !!adapter) {
        const wallet = createWallet(farcasterWallet);

        setWallets(prev => [...prev, wallet]);

        if (para.supportedWalletTypes.some(({ type }) => type === 'SOLANA')) {
          await connectBase(adapter, true);
        }

        setIsFarcasterSetup(true);
      }
    };

    setupFarcaster();
  }, [para.isFarcasterMiniApp, wallets, adapters]);

  const injectedWallets = adapters
    .filter(wallet => wallet.adapter.name !== 'Mobile Wallet Adapter' && !wallets.some(w => w.name === wallet.adapter.name))
    .map(wallet => {
      const adapter = wallet.adapter;

      return {
        connect: () => connect(adapter),
        connectMobile: () => connect(adapter),
        type: 'SOLANA',
        installed:
          adapter &&
          (adapter?.readyState === WalletReadyState.Installed || adapter?.readyState === WalletReadyState.Loadable),
        name: adapter.name,
        iconUrl: adapter.icon,
        // Using name here since that's the only common id across the networks
        id: adapter.name,
        internalId: adapter.name,
      } as CommonWallet;
    });

  const walletsWithInjected = [...wallets, ...injectedWallets];

  return (
    <SolanaExternalWalletContext.Provider
      value={useMemo(
        () => ({
          wallets: walletsWithInjected,
          disconnect,
          disconnectStatus: disconnecting ? 'pending' : 'idle',
          signMessage,
          signVerificationMessage,
          requestInfo,
          disconnectBase,
          farcasterStatus,
          ...externalHooks,
        }),
        [
          walletsWithInjected,
          disconnect,
          disconnecting,
          signMessage,
          signVerificationMessage,
          requestInfo,
          farcasterStatus,
          disconnectBase,
        ],
      )}
    >
      {children}
    </SolanaExternalWalletContext.Provider>
  );
}
