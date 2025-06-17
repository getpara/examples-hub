import { PropsWithChildren, createContext, useEffect, useMemo, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Adapter, isIosAndRedirectable, WalletReadyState } from '@solana/wallet-adapter-base';
import { AuthState, ExternalWalletInfo } from '@getpara/web-sdk';
import { CreateWalletFn } from '../types/Wallet.js';
import {
  ExternalWalletContextType,
  ExternalWalletProviderConfig,
  ExternalWalletProviderConfigBase,
  SignArgs,
  TExternalWallet,
  type CommonWallet,
} from '@getpara/react-common';
import bs58 from 'bs58';

export const defaultSolanaExternalWallet = {
  wallets: [],
  disconnect: () => Promise.resolve(),
  signMessage: () => Promise.resolve({}),
  signVerificationMessage: () => Promise.resolve({}),
  requestInfo: () => Promise.resolve({} as ExternalWalletInfo),
  disconnectBase: () => Promise.resolve(),
};

export type SolanaExternalWalletContextType = ExternalWalletContextType;

export const SolanaExternalWalletContext = createContext<SolanaExternalWalletContextType>(defaultSolanaExternalWallet);

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
}: SolanaExternalWalletProviderConfigFull & PropsWithChildren) {
  const {
    wallets: adapters,
    select: selectWallet,
    disconnect,
    publicKey: solanaAddress,
    wallet,
    connecting,
    signMessage: solanaSignMessage,
  } = useWallet();

  const isLinkingAccount = useRef(false);

  const solanaSignMessageRef = useRef<typeof solanaSignMessage>(solanaSignMessage);
  const solanaAddressRef = useRef<typeof solanaAddress | undefined>(solanaAddress);
  const verificationMessage = useRef<string>();

  const reset = async () => {
    await disconnect();
    await para.logout();
  };

  const _reset = async ({ logout = false }: { logout?: boolean } = {}) => {
    await disconnect();
    if (logout) {
      await para.logout();
    }
  };

  const login = async ({
    address,
    providerId,
    providerName,
  }: {
    address: string;
    providerId: TExternalWallet;
    providerName?: string;
  }) => {
    try {
      return await para.loginExternalWallet({
        externalWallet: {
          address,
          type: 'SOLANA',
          provider: providerName,
          providerId,
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
            providerId: getWallet(wallet?.adapter?.name ?? '')?.internalId,
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

    if (!!solanaAddress && !storedExternalWallet && !isLinkingAccount.current) {
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
      !isLinkingAccount.current
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

    // if (switchWallet) {
    selectWallet(adapter.name);
    // Using a timeout here to ensure the selectWallet function sets the wallet completely before connecting.
    // Without this there was a race condition where connect wasn't correctly listening to the adapters connect event.
    await new Promise(resolve => setTimeout(resolve, 100));
    // }

    try {
      await adapter.connect();
      await new Promise(resolve => setTimeout(resolve, 100));

      while (!adapter.publicKey) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const address = adapter.publicKey.toString();

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
          authState = await login({ address, providerId: getWallet(adapter.name)?.internalId, providerName: adapter.name });
          verificationMessage.current = authState.stage === 'verify' ? authState.signatureVerificationMessage : undefined;
        } catch (err) {
          await disconnect();
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

  const requestInfo = async (providerId: TExternalWallet): Promise<ExternalWalletInfo> => {
    const wallet = wallets.find(w => w.internalId === providerId);

    const adapter = getAdapter(wallet.name ?? '');

    isLinkingAccount.current = true;
    try {
      const address = await connectBase(adapter);

      const externalWallet: ExternalWalletInfo = {
        address,
        type: 'SOLANA',
        providerId: wallet.internalId,
        provider: wallet.name,
      };

      return externalWallet;
    } catch (e) {
      // await disconnectBase(providerId);
      console.error('Error linking account:', e);
      throw new Error(e?.message ?? e);
    }
  };

  const disconnectBase = async (providerId: TExternalWallet) => {
    const wallet = wallets.find(w => w.internalId === providerId);

    const adapter = getAdapter(wallet.name ?? '');

    if (!adapter?.connected) {
      return;
    }

    isLinkingAccount.current = true;

    try {
      await adapter.disconnect();
    } catch (e) {
      console.error('Error disconnecting wallet:', e);
      throw new Error(e?.message ?? e);
    }
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

  return (
    <SolanaExternalWalletContext.Provider
      value={useMemo(
        () => ({ wallets, disconnect, signMessage, signVerificationMessage, requestInfo, disconnectBase }),
        [wallets, disconnect, signMessage, signVerificationMessage, requestInfo, disconnectBase],
      )}
    >
      {children}
    </SolanaExternalWalletContext.Provider>
  );
}
