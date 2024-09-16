import { ReactNode, createContext, useEffect, useMemo, useState } from 'react';
import { CommonChain, CommonWallet } from '../types/CommonTypes.js';
import { useCapsuleCosmos } from './CapsuleCosmosContext.js';
import { MobileConnectResponse, useShuttle } from '@delphi-labs/shuttle-react';
import CapsuleWeb, { isAndroid, isIOS, isMobile, WalletType } from '@usecapsule/web-sdk';

export const defaultCosmosExternalWallet = {
  wallets: [],
  chains: [],
  chainId: undefined,
  disconnect: () => Promise.resolve(),
  switchChain: () => Promise.resolve({}),
};

export const CosmosExternalWalletContext = createContext<{
  wallets: CommonWallet[];
  chains: CommonChain[];
  chainId: string;
  disconnect: () => Promise<void>;
  switchChain: (chainId: string) => Promise<{ error?: string[] }>;
}>(defaultCosmosExternalWallet);

interface CosmosExternalWalletProviderProps {
  children: ReactNode;
  capsule: CapsuleWeb;
  onSwitchWallet: (args: { address?: string; error?: string }) => void;
}

export function CosmosExternalWalletProvider({ children, capsule, onSwitchWallet }: CosmosExternalWalletProviderProps) {
  const { connect: connectAsync, mobileConnect, disconnect: _disconnect, getWallets } = useShuttle();
  const { selectedChainId, wallets: incompleteWallets, chains, onSwitchChain } = useCapsuleCosmos();
  const [mobileUrls, setMobileUrls] = useState<Record<string, MobileConnectResponse>>({});
  const [isLocalConnecting, setIsLocalConnecting] = useState(false);

  const wallet = getWallets({ chainId: selectedChainId })?.[0];

  const reset = async () => {
    _disconnect();
    await capsule.logout(true);
  };

  const switchChain = async (chainId: string) => {
    let error: string[];

    const newWallet = getWallets({ providerId: wallet.providerId, chainId: chainId })[0];

    if (!newWallet) {
      setIsLocalConnecting(true);
      let changeResp: { address?: string; error?: string };

      const isMobileProvider = !!incompleteWallets.find(w => w.mobileProvider.id === wallet.providerId);

      if (isMobileProvider) {
        changeResp = await connectMobile(wallet.providerId, chainId);
      } else {
        changeResp = await connect(wallet.providerId, chainId);
      }
      // Calling onSwitchWallet here so the modal correctly processes any error from the reconnection.
      onSwitchWallet(changeResp);

      setIsLocalConnecting(false);
      error = [changeResp?.error];
    }

    onSwitchChain(chainId);
    return { error };
  };

  const login = async (address: string, providerName?: string) => {
    try {
      await capsule.externalWalletLogin(address, WalletType.COSMOS, providerName);
    } catch (err) {
      await reset();

      throw 'Error logging you in. Please try again.';
    }
  };

  const switchWallet = async (address?: string) => {
    let error: string;

    // If we're calling switch wallet with no address, treat it as if the user disconnected the wallet from the app and logout to reset the Capsule instance.
    if (!address) {
      await reset();
    } else {
      try {
        await login(address, getProviderName(wallet.providerId));
      } catch (err) {
        error = err;
      }
    }

    onSwitchWallet({ address, error });
  };

  // Watching for state where Shuttle has a wallet stored but Capsule doesn't.
  // In this case we want to disconnect and logout.
  useEffect(() => {
    const storedExternalWallet = capsule.externalWallets[wallet.account.address];

    if (!isLocalConnecting && !!wallet && !storedExternalWallet) {
      reset();
    }
  }, []);

  useEffect(() => {
    const storedExternalWallet = capsule.externalWallets[capsule.currentExternalWalletAddresses?.[0] ?? ''];
    // If the user is using an external Cosmos wallet we want to watch for wallet changes and log them in to a different user when the wallet changes
    if (storedExternalWallet?.type === WalletType.COSMOS && storedExternalWallet?.address !== wallet?.account.address) {
      switchWallet(wallet?.account.address);
    }
  }, [wallet]);

  const connect = async (providerId?: string, chainId?: string): Promise<{ address?: string; error?: string }> => {
    setIsLocalConnecting(true);

    // chainID is passed in when switching chains, in that case we can skip disconnecting
    if (!chainId) {
      _disconnect();
    }

    let address: string | undefined;
    let error: string | undefined;

    // The logic in the modal should prevent this from happening, logging for edge cases.
    if (!providerId) {
      console.error('Extension provider ID not provided.');
    } else {
      try {
        const connectedWallet = await connectAsync({
          extensionProviderId: providerId,
          chainId: chainId ?? selectedChainId,
        });

        address = connectedWallet.account.address;

        if (address) {
          try {
            await login(address, getProviderName(providerId));
          } catch (err) {
            address = undefined;
            error = err;
          }
        }
      } catch (err) {
        error = 'An unknown error occurred.';
      }
    }

    setIsLocalConnecting(false);
    return { address, error };
  };

  const connectMobile = async (providerId: string, chainId?: string): Promise<{ address?: string; error?: string }> => {
    // The logic in the modal should prevent this from happening, logging for edge cases.
    if (!providerId) {
      console.error('Mobile provider ID not provided.');
      return;
    }

    setIsLocalConnecting(true);

    // chainID is passed in when switching chains, in that case we can skip disconnecting
    if (!chainId) {
      _disconnect();
    }

    return new Promise(async resolve => {
      const urls = await mobileConnect({
        mobileProviderId: providerId,
        chainId: chainId ?? selectedChainId,
        callback: async walletConnection => {
          setMobileUrls({});
          if (walletConnection.account.address) {
            try {
              await login(walletConnection.account.address, getProviderName(providerId));
            } catch (err) {
              resolve({ error: err });
            } finally {
              setIsLocalConnecting(false);
            }
            resolve({ address: walletConnection.account.address });
          } else {
            setIsLocalConnecting(false);
            resolve({ error: 'An unknown error occurred.' });
          }
        },
      });

      setMobileUrls(curr => ({ ...curr, [providerId]: urls }));
    });
  };

  const getQrUri = (providerUrls: MobileConnectResponse) => async () => {
    if (providerUrls) {
      if (isMobile()) {
        if (isAndroid()) {
          return providerUrls.androidUrl;
        } else if (isIOS()) {
          return providerUrls.iosUrl;
        } else {
          return providerUrls.qrCodeUrl;
        }
      } else {
        return providerUrls.qrCodeUrl;
      }
    }
  };

  const getProviderName = (providerId: string) =>
    incompleteWallets.find(w => w.mobileProvider.id === providerId || w.extensionProvider.id === providerId)?.name;

  const wallets = incompleteWallets
    .map(wallet => {
      if (!wallet.mobileProvider && !wallet.extensionProvider) {
        console.warn(
          `One of extensionProvider or mobileProvider must be provided, ${wallet.name} will not be added to the wallet list.`,
        );

        return undefined;
      }

      return {
        connect: () => connect(wallet.extensionProvider?.id),
        connectMobile: () => connectMobile(wallet.mobileProvider?.id),
        getQrUri: getQrUri(mobileUrls[wallet.mobileProvider?.id]),
        type: WalletType.COSMOS,
        ...wallet,
      } as CommonWallet;
    })
    .filter(w => !!w);

  const formattedChains: CommonChain[] = chains.map(c => {
    return {
      id: c.chainId,
      name: c.name,
    };
  });

  const disconnect = async () => _disconnect();

  return (
    <CosmosExternalWalletContext.Provider
      value={useMemo(
        () => ({ wallets, chains: formattedChains, chainId: selectedChainId, disconnect, switchChain }),
        [wallets, formattedChains, selectedChainId, disconnect, switchChain],
      )}
    >
      {children}
    </CosmosExternalWalletContext.Provider>
  );
}
