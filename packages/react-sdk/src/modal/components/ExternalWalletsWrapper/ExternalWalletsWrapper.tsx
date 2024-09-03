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
  // SolanaWallet
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

interface ExternalWalletsWrapperProps extends PropsWithChildren {
  wallets?: TExternalWallet[];
}

export const ExternalWalletsWrapper = ({ children, wallets }: ExternalWalletsWrapperProps) => {
  const capsule = useCapsuleStore(state => state.capsule);
  const resetModalState = useModalStore(state => state.resetState);
  const resetUserInfoState = useUserInfoStore(state => state.resetState);

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
      let hasEvmWallet = false;
      let newEvmContext: Context<EvmExternalWalletContextType>;
      let newEvmProvider: typeof EvmExternalWalletProvider;

      // let hasSolanaWallet = false;
      let newSolanaContext: Context<SolanaExternalWalletContextType>;
      let newSolanaProvider: typeof SolanaExternalWalletProvider;

      // let hasCosmosWallet = false;
      let newCosmosContext: Context<CosmosExternalWalletContextType>;
      let newCosmosProvider: typeof CosmosExternalWalletProvider;

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
            hasEvmWallet = true;

            try {
              const { EvmExternalWalletProvider, EvmExternalWalletContext } = await import(
                '@usecapsule/evm-wallet-connectors'
              );

              newEvmContext = EvmExternalWalletContext;
              newEvmProvider = EvmExternalWalletProvider;
            } catch (e) {
              throw new Error('@usecapsule/evm-wallet-connectors is required to use an external EVM wallet.');
            }
          } else if (!hasEvmWallet) {
            newEvmContext = EvmExternalWalletContext;
            newEvmProvider = EvmExternalWalletProvider;
          }

          // Handle Solana Wallets
          // if (wallet in SolanaWallet) {
          //   hasSolanaWallet = true;

          //   try {
          //     const { SolanaExternalWalletProvider, SolanaExternalWalletContext } = await import(
          //       '@usecapsule/solana-wallet-connectors'
          //     );

          //     newSolanaContext = SolanaExternalWalletContext;
          //     newSolanaProvider = SolanaExternalWalletProvider;
          //   } catch (e) {
          //     throw new Error('@usecapsule/solana-wallet-connectors is required to use an external Solana wallet.');
          //   }
          // } else if (!hasSolanaWallet) {
          //   newSolanaContext = SolanaExternalWalletContext;
          //   newSolanaProvider = SolanaExternalWalletProvider;
          // }
          newSolanaContext = SolanaExternalWalletContext;
          newSolanaProvider = SolanaExternalWalletProvider;

          // Handle Cosmos Wallets
          // if (wallet in CosmosWallet) {
          //   hasCosmosWallet = true;

          //   try {
          //     const { CosmosExternalWalletProvider, CosmosExternalWalletContext } = await import(
          //       '@usecapsule/cosmos-wallet-connectors'
          //     );

          //     newCosmosContext = CosmosExternalWalletContext;
          //     newCosmosProvider = CosmosExternalWalletProvider;
          //   } catch (e) {
          //     throw new Error('@usecapsule/cosmos-wallet-connectors is required to use an external Cosmos wallet.');
          //   }
          // } else if (!hasCosmosWallet) {
          //   newCosmosContext = CosmosExternalWalletContext;
          //   newCosmosProvider = CosmosExternalWalletProvider;
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
  }, [wallets]);

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
