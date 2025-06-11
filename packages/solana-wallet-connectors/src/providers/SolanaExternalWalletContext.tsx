import { PropsWithChildren, createContext, useEffect, useMemo, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Adapter, isIosAndRedirectable, WalletReadyState } from '@solana/wallet-adapter-base';
import ParaWeb, { AuthState } from '@getpara/web-sdk';
import { WalletList } from '../types/Wallet.js';
import { TExternalWallet, type CommonWallet } from '@getpara/react-common';
import bs58 from 'bs58';

const defaultSolanaExternalWallet = {
  wallets: [],
  disconnect: () => Promise.resolve(),
  signMessage: () => Promise.resolve({}),
  signVerificationMessage: () => Promise.resolve({}),
};

export type SolanaExternalWalletContextType = {
  wallets: CommonWallet[];
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<{ signature?: string; error?: string }>;
  signVerificationMessage: () => Promise<{
    address?: string;
    signature?: string;
    error?: string;
  }>;
};

export const SolanaExternalWalletContext = createContext<SolanaExternalWalletContextType>(defaultSolanaExternalWallet);

export type SolanaExternalWalletProviderConfig = {
  onSwitchWallet?: (args: { address?: string; error?: string }) => void;
  para: ParaWeb;
  walletsWithFullAuth: TExternalWallet[];
  includeWalletVerification?: boolean;
  connectionOnly?: boolean;
};

type SolanaExternalWalletProviderConfigFull = {
  wallets: WalletList;
} & SolanaExternalWalletProviderConfig;

export function SolanaExternalWalletProvider({
  children,
  wallets: walletFns,
  onSwitchWallet,
  para,
  walletsWithFullAuth,
  includeWalletVerification,
  connectionOnly,
}: SolanaExternalWalletProviderConfigFull & PropsWithChildren) {
  const {
    wallets: adapters,
    select: selectWallet,
    disconnect: _disconnect,
    publicKey: solanaAddress,
    wallet,
    connecting,
    connected,
    signMessage: solanaSignMessage,
  } = useWallet();

  const verificationMessage = useRef<string>();

  const reset = async () => {
    await _disconnect();
    await para.logout();
  };

  const login = async ({ address, providerName }: { address: string; providerName?: string }) => {
    try {
      return await para.loginExternalWallet({
        externalWallet: {
          address,
          type: 'SOLANA',
          provider: providerName,
          withFullParaAuth: walletsWithFullAuth?.includes(
            (getWallet(providerName ?? '')?.id.toUpperCase() ?? '') as TExternalWallet,
          ),
          withVerification: includeWalletVerification,
          isConnectionOnly: connectionOnly,
        },
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

    if (!!solanaAddress && !storedExternalWallet) {
      reset();
    }
  }, []);

  useEffect(() => {
    const storedExternalWallet = Object.values(para.externalWallets || {})[0];

    // If the user is using an external Solana wallet we want to watch for wallet changes and log them in to a different user when the wallet changes
    if (
      !connecting &&
      (!wallet || wallet?.adapter.connected) &&
      storedExternalWallet?.type === 'SOLANA' &&
      storedExternalWallet?.address !== solanaAddress?.toString()
    ) {
      switchWallet(solanaAddress?.toString());
    }
  }, [solanaAddress, connecting, wallet]);

  const signMessage = async (message: string) => {
    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await solanaSignMessage(encodedMessage);

      return {
        address: solanaAddress.toString(),
        signature: bs58.encode(signature),
      };
    } catch (e) {
      if (e.message.includes('User rejected the request')) {
        return { error: 'Signature request rejected' };
      }
      return { error: 'An unknown error occurred' };
    }
  };

  const signVerificationMessage = async () => {
    const signature = await signMessage(verificationMessage.current);

    return signature;
  };

  const connect = async (adapter?: Adapter): Promise<{ address?: string; error?: string; authState?: AuthState }> => {
    // If on iOS, rely on the redirect happening in the modal.
    if (isIosAndRedirectable()) {
      return;
    }

    await _disconnect();

    if (!adapter) {
      return { error: 'Adapter not found.' };
    }

    selectWallet(adapter.name);
    // Using a timeout here to ensure the selectWallet function sets the wallet completely before connecting.
    // Without this there was a race condition where connect wasn't correctly listening to the adapters connect event.
    await new Promise(resolve => setTimeout(resolve, 100));

    let address: string | undefined;
    let error: string | undefined;
    let authState: AuthState | undefined;

    try {
      await adapter.connect();

      address = adapter.publicKey.toString();

      if (address) {
        try {
          authState = await login({ address, providerName: adapter.name });
          verificationMessage.current = authState.stage === 'verify' ? authState.signatureVerificationMessage : undefined;
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
    return { address, error, authState };
  };

  const getAdapter = (name: string) =>
    adapters.find(a => (a.adapter.name === 'Mobile Wallet Adapter' ? a : a.adapter.name === name ? a : false))?.adapter;

  const getWallet = (name: string) => wallets.find(w => w.name === name);

  const wallets = walletFns.map(walletFn => {
    const metaData = walletFn();
    const adapter = getAdapter(metaData.name);

    return {
      connect: () => connect(adapter),
      connectMobile: () => connect(adapter),
      type: 'SOLANA',
      installed:
        adapter && (adapter?.readyState === WalletReadyState.Installed || adapter?.readyState === WalletReadyState.Loadable),
      ...metaData,
    } as CommonWallet;
  });

  const disconnect = async () => {
    await _disconnect();
    // The solana library seems to keep some state hanging around that will auto receonnect the same wallet if the window isn't refreshed and the wallet connector is selected again in the modal.
    // Refreshing here after a disconnect fixes the issue.
    if (connected) {
      typeof window !== undefined && window?.location.reload();
    }
  };

  return (
    <SolanaExternalWalletContext.Provider
      value={useMemo(
        () => ({ wallets, disconnect, signMessage, signVerificationMessage }),
        [wallets, disconnect, signMessage, signVerificationMessage],
      )}
    >
      {children}
    </SolanaExternalWalletContext.Provider>
  );
}
