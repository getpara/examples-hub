import { ReactNode, createContext, useEffect, useMemo } from 'react';
import { CommonWallet } from '../types/CommonTypes.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { Adapter, WalletReadyState } from '@solana/wallet-adapter-base';
import { useParaSolana } from './ParaSolanaProvider.js';
import ParaWeb, { WalletType } from '@getpara/web-sdk';

export const defaultSolanaExternalWallet = {
  wallets: [],
  disconnect: () => Promise.resolve(),
};

export const SolanaExternalWalletContext = createContext<{
  wallets: CommonWallet[];
  disconnect: () => Promise<void>;
}>(defaultSolanaExternalWallet);

interface SolanaExternalWalletProviderProps {
  children: ReactNode;
  para: ParaWeb;
  onSwitchWallet: (args: { address?: string; error?: string }) => void;
}

export function SolanaExternalWalletProvider({ children, para, onSwitchWallet }: SolanaExternalWalletProviderProps) {
  const {
    wallets: adapters,
    select: selectWallet,
    disconnect: _disconnect,
    publicKey: solanaAddress,
    wallet,
    connecting,
  } = useWallet();
  const { wallets: walletFns } = useParaSolana();

  const reset = async () => {
    await _disconnect();
    await para.logout();
  };

  const login = async (address: string, providerName?: string) => {
    try {
      await para.externalWalletLogin({ address, type: WalletType.SOLANA, provider: providerName });
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
      try {
        await login(address, wallet?.adapter?.name);
      } catch (err) {
        error = err;
      }
    }

    onSwitchWallet({ address, error });
  };

  useEffect(() => {
    const storedExternalWallet = para.externalWallets[solanaAddress?.toString() ?? ''];

    if (!!solanaAddress && !storedExternalWallet) {
      reset();
    }
  }, []);

  useEffect(() => {
    const storedExternalWallet = para.externalWallets[para.currentExternalWalletAddresses?.[0] ?? ''];

    // If the user is using an external Solana wallet we want to watch for wallet changes and log them in to a different user when the wallet changes
    if (
      !connecting &&
      storedExternalWallet?.type === WalletType.SOLANA &&
      storedExternalWallet?.address !== solanaAddress?.toString()
    ) {
      switchWallet(solanaAddress?.toString());
    }
  }, [solanaAddress, connecting]);

  const connect = async (adapter?: Adapter): Promise<{ address?: string; error?: string }> => {
    await _disconnect();

    if (!adapter) {
      return { address: undefined, error: 'Adapter not found.' };
    }

    selectWallet(adapter.name);
    // Using a timeout here to ensure the selectWallet function sets the wallet completely before connecting.
    // Without this there was a race condition where connect wasn't correctly listening to the adapters connect event.
    await new Promise(resolve => setTimeout(resolve, 100));

    let address: string | undefined;
    let error: string | undefined;

    try {
      await adapter.connect();

      address = adapter.publicKey.toString();

      if (address) {
        try {
          await login(address, adapter.name);
        } catch (err) {
          await _disconnect();
          address = undefined;
          error = err;
        }
      }
    } catch (err) {
      switch (err.message) {
        case 'User aborted.':
        case 'Approval Denied':
        case 'You canceled this request.': {
          error = 'Connection request rejected';
          break;
        }
        default: {
          error = 'An unknown error occurred';
          break;
        }
      }
    }
    return { address, error };
  };

  const getAdapter = (name: string) =>
    adapters.find(a => (a.adapter.name === 'Mobile Wallet Adapter' ? a : a.adapter.name === name ? a : false))?.adapter;

  const wallets = walletFns.map(walletFn => {
    const metaData = walletFn();
    const adapter = getAdapter(metaData.name);

    return {
      connect: () => connect(adapter),
      connectMobile: () => connect(adapter),
      getQrUri: () => '',
      type: WalletType.SOLANA,
      installed:
        adapter && (adapter?.readyState === WalletReadyState.Installed || adapter?.readyState === WalletReadyState.Loadable),
      ...metaData,
    } as CommonWallet;
  });

  const disconnect = async () => {
    await _disconnect();
    // The solana library seems to keep some state hanging around that will auto receonnect the same wallet if the window isn't refreshed and the wallet connector is selected again in the modal.
    // Refreshing here after a disconnect fixes the issue.
    typeof window !== undefined && window?.location.reload();
  };

  return (
    <SolanaExternalWalletContext.Provider value={useMemo(() => ({ wallets, disconnect }), [wallets, disconnect])}>
      {children}
    </SolanaExternalWalletContext.Provider>
  );
}
