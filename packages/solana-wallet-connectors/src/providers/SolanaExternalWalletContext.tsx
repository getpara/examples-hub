import { ReactNode, createContext, useEffect, useMemo } from 'react';
import { CommonWallet } from '../types/CommonTypes';
import { useWallet } from '@solana/wallet-adapter-react';
import { Adapter, WalletReadyState } from '@solana/wallet-adapter-base';
import { useCapsuleSolana } from './CapsuleSolanaProvider.js';
import CapsuleWeb, { WalletType, isMobile } from '@usecapsule/web-sdk';

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
  capsule: CapsuleWeb;
  onSwitchWallet: (args: { address?: string; error?: string }) => void;
}

export function SolanaExternalWalletProvider({ children, capsule, onSwitchWallet }: SolanaExternalWalletProviderProps) {
  const { wallets: adapters, select: selectWallet, disconnect: _disconnect, publicKey: solanaAddress, wallet } = useWallet();
  const { wallets: walletFns } = useCapsuleSolana();

  const reset = async () => {
    await _disconnect();
    await capsule.logout(true);
  };

  const login = async (address: string, providerName?: string) => {
    try {
      await capsule.externalWalletLogin(address, WalletType.SOLANA, providerName);
    } catch (err) {
      await reset();

      throw 'Error logging you in. Please try again.';
    }
  };

  const switchWallet = async (address?: string) => {
    let error: string;

    // If we're calling switch wallet with no address, treat it as if the user disconnected the wallet from the app and logout to reset the Capsule instance.
    if (!address) {
      await capsule.logout(true);
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
    const storedExternalWallet = capsule.externalWallets[solanaAddress?.toString() ?? ''];

    if (!!solanaAddress && !storedExternalWallet) {
      reset();
    }
  }, []);

  useEffect(() => {
    const storedExternalWallet = capsule.externalWallets[capsule.currentExternalWalletAddresses?.[0] ?? ''];

    // If the user is using an external Solana wallet we want to watch for wallet changes and log them in to a different user when the wallet changes
    if (storedExternalWallet?.type === WalletType.SOLANA && storedExternalWallet?.address !== solanaAddress?.toString()) {
      switchWallet(solanaAddress?.toString());
    }
  }, [solanaAddress]);

  const connect = async (adapter?: Adapter): Promise<{ address?: string; error?: string }> => {
    await _disconnect();

    if (!adapter) {
      return { address: undefined, error: 'Adapter not found.' };
    }

    selectWallet(adapter.name);

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
    adapters.find(a => a.adapter.name === (isMobile() ? 'Mobile Wallet Adapter' : name))?.adapter;

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

  const disconnect = _disconnect;

  return (
    <SolanaExternalWalletContext.Provider value={useMemo(() => ({ wallets, disconnect }), [wallets, disconnect])}>
      {children}
    </SolanaExternalWalletContext.Provider>
  );
}
