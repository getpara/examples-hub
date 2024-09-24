import { Context, FC, PropsWithChildren, useEffect, useState } from 'react';
import { ExternalWalletProvider } from '../../providers/ExternalWalletContext.js';
import {
  EvmExternalWalletContext,
  EvmExternalWalletProvider,
  EvmExternalWalletContextType,
  EvmExternalWalletProviderProps,
} from '../../providers/EvmExternalWalletContextStub.js';
import {
  // CosmosWallet,
  EvmWallet,
  TExternalWallet,
  SolanaWallet,
} from '../../types/externalWallets.js';
import {
  SolanaExternalWalletContext,
  SolanaExternalWalletContextType,
  SolanaExternalWalletProvider,
  SolanaExternalWalletProviderProps,
} from '../../providers/SolanaExternalWalletContextStub.js';
import {
  CosmosExternalWalletContext,
  CosmosExternalWalletContextType,
  CosmosExternalWalletProvider,
  CosmosExternalWalletProviderProps,
} from '../../providers/CosmosExternalWalletContextStub.js';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores/index.js';
import { useExternalWalletProviderStore } from '../../stores/externalWalletProvider/useExternalWalletProviderStore.js';

interface ExternalWalletsWrapperProps extends PropsWithChildren {
  wallets?: TExternalWallet[];
}

export const ExternalWalletsWrapper = ({ children, wallets }: ExternalWalletsWrapperProps) => {
  const capsule = useCapsuleStore(state => state.capsule);
  const resetModalState = useModalStore(state => state.resetState);
  const resetUserInfoState = useUserInfoStore(state => state.resetState);
  const StoredEvmProvider = useExternalWalletProviderStore(state => state.EvmProvider);
  const storedEvmContext = useExternalWalletProviderStore(state => state.evmContext);
  const StoredSolanaProvider = useExternalWalletProviderStore(state => state.SolanaProvider);
  const storedSolanaContext = useExternalWalletProviderStore(state => state.solanaContext);
  // const StoredCosmosProvider = useExternalWalletProviderStore(state => state.CosmosProvider);
  // const storedCosmosContext = useExternalWalletProviderStore(state => state.cosmosContext);

  // EVM
  const [EvmProvider, setEvmProvider] = useState<FC<EvmExternalWalletProviderProps> | null>(null);
  const [evmContext, setEvmContext] = useState<Context<EvmExternalWalletContextType> | null>(null);

  // Solana
  const [SolanaProvider, setSolanaProvider] = useState<FC<SolanaExternalWalletProviderProps> | null>(null);
  const [solanaContext, setSolanaContext] = useState<Context<SolanaExternalWalletContextType> | null>(null);

  // Cosmos
  const [CosmosProvider, setCosmosProvider] = useState<FC<CosmosExternalWalletProviderProps> | null>(null);
  const [cosmosContext, setCosmosContext] = useState<Context<CosmosExternalWalletContextType> | null>(null);

  useEffect(() => {
    const loadProviders = async () => {
      let newEvmContext: Context<EvmExternalWalletContextType> = EvmExternalWalletContext;
      let newEvmProvider: typeof EvmExternalWalletProvider = EvmExternalWalletProvider;

      let newSolanaContext: Context<SolanaExternalWalletContextType> = SolanaExternalWalletContext;
      let newSolanaProvider: typeof SolanaExternalWalletProvider = SolanaExternalWalletProvider;

      let newCosmosContext: Context<CosmosExternalWalletContextType> = CosmosExternalWalletContext;
      let newCosmosProvider: typeof CosmosExternalWalletProvider = CosmosExternalWalletProvider;

      if (!wallets?.length) {
        newEvmContext = EvmExternalWalletContext;
        newEvmProvider = EvmExternalWalletProvider;

        newSolanaContext = SolanaExternalWalletContext;
        newSolanaProvider = SolanaExternalWalletProvider;

        newCosmosContext = CosmosExternalWalletContext;
        newCosmosProvider = CosmosExternalWalletProvider;
      } else {
        for (let i = 0; i < wallets.length; i++) {
          const wallet = wallets[i];

          // Handle EVM Wallets
          if (wallet in EvmWallet) {
            if (!StoredEvmProvider || !storedEvmContext) {
              throw new Error('@usecapsule/evm-wallet-connectors is required to use an external EVM wallet.');
            } else {
              newEvmContext = storedEvmContext;
              newEvmProvider = StoredEvmProvider;
            }
          }

          // Handle Solana Wallets
          if (wallet in SolanaWallet) {
            if (!StoredSolanaProvider || !storedSolanaContext) {
              throw new Error('@usecapsule/solana-wallet-connectors is required to use an external Solana wallet.');
            } else {
              newSolanaContext = storedSolanaContext;
              newSolanaProvider = StoredSolanaProvider;
            }
          }

          // Handle Cosmos Wallets
          // if (wallet in CosmosWallet) {
          //   if (!StoredCosmosProvider || !storedCosmosContext) {
          //     throw new Error('@usecapsule/cosmos-wallet-connectors is required to use an external Cosmos wallet.');
          //   } else {
          //     newCosmosContext = storedCosmosContext;
          //     newCosmosProvider = StoredCosmosProvider;
          //   }
          // }
          newCosmosContext = CosmosExternalWalletContext;
          newCosmosProvider = CosmosExternalWalletProvider;
        }
      }

      setEvmContext(newEvmContext);
      setEvmProvider(() => newEvmProvider);

      setSolanaContext(newSolanaContext);
      setSolanaProvider(() => newSolanaProvider);

      setCosmosContext(newCosmosContext);
      setCosmosProvider(() => newCosmosProvider);
    };

    loadProviders();
  }, [wallets, storedEvmContext, StoredEvmProvider, storedSolanaContext, StoredSolanaProvider]);

  const handleSwitchWallet = ({ address, error }: { address?: string; error?: string }) => {
    // If we error on switch wallets we logged out the Capsule instance so we need to reset the modal state
    // Or if we don't return an address on switch wallets we logged out the Capsule instance so we need to reset the modal state
    if (error || !address) {
      resetModalState();
      resetUserInfoState();
    }
  };

  if (!capsule || !EvmProvider || !SolanaProvider || !CosmosProvider) {
    return null;
  }

  return (
    <EvmProvider capsule={capsule} onSwitchWallet={handleSwitchWallet}>
      <SolanaProvider capsule={capsule} onSwitchWallet={handleSwitchWallet}>
        <CosmosProvider capsule={capsule} onSwitchWallet={handleSwitchWallet}>
          <ExternalWalletProvider
            evmContext={evmContext}
            solanaContext={solanaContext}
            cosmosContext={cosmosContext}
            walletSort={wallets}
          >
            {children}
          </ExternalWalletProvider>
        </CosmosProvider>
      </SolanaProvider>
    </EvmProvider>
  );
};
