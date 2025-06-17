import { useQuery } from '@tanstack/react-query';
import { JsonRpcProvider } from 'ethers';
import { Connection } from '@solana/web3.js';
import { ParaEthersSigner } from '@getpara/ethers-v6-integration';
import { ParaSolanaWeb3Signer } from '@getpara/solana-web3.js-v1-integration';
import { usePara } from './usePara';
import { useWallets } from './useWallets';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { createAuthDependentQueryOptions } from '@/utils/queryUtils';

interface SignersResult {
  ethereumProvider: JsonRpcProvider | null;
  ethereumSigner: ParaEthersSigner | null;
  solanaConnection: Connection | null;
  solanaSigner: ParaSolanaWeb3Signer | null;
}

interface SignersError {
  error: string;
  details?: unknown;
}

export const useSigners = () => {
  const { paraClient, isAuthenticated, isClientReady } = usePara();
  const { wallets: _wallets, hasEvmWallets, hasSolanaWallets } = useWallets();

  const {
    data,
    isLoading: isSignersLoading,
    isError: isSignersError,
    error: signersError,
    refetch: reinitializeSigners,
  } = useQuery<SignersResult | SignersError>(
    createAuthDependentQueryOptions(
      isClientReady && isAuthenticated && (hasEvmWallets || hasSolanaWallets),
      {
        queryKey: QUERY_KEYS.SIGNERS,
        queryFn: async (): Promise<SignersResult | SignersError> => {
          if (!paraClient || !isAuthenticated) {
            return {
              error: 'Para client not initialized or not authenticated',
            };
          }

          try {
            let ethereumProvider: JsonRpcProvider | null = null;
            let ethereumSigner: ParaEthersSigner | null = null;
            let solanaConnection: Connection | null = null;
            let solanaSigner: ParaSolanaWeb3Signer | null = null;

            // Create Para signers for EVM wallets
            if (hasEvmWallets && paraClient) {
              const provider = new JsonRpcProvider('https://eth.llamarpc.com');
              ethereumSigner = new ParaEthersSigner(paraClient, provider);
              ethereumProvider = provider;
            }

            // Create Para signers for Solana wallets
            if (hasSolanaWallets && paraClient) {
              const connection = new Connection(
                'https://api.mainnet-beta.solana.com',
                'confirmed'
              );
              solanaSigner = new ParaSolanaWeb3Signer(paraClient, connection);
              solanaConnection = connection;
            }

            return {
              ethereumProvider,
              ethereumSigner,
              solanaConnection,
              solanaSigner,
            };
          } catch (error) {
            return {
              error: 'Failed to initialize blockchain signers',
              details: error,
            };
          }
        },
      }
    )
  );

  // Handle error state
  const isError = !!(data && 'error' in data);
  const ethereumProvider =
    data && 'ethereumProvider' in data ? data.ethereumProvider : null;
  const ethereumSigner =
    data && 'ethereumSigner' in data ? data.ethereumSigner : null;
  const solanaConnection =
    data && 'solanaConnection' in data ? data.solanaConnection : null;
  const solanaSigner =
    data && 'solanaSigner' in data ? data.solanaSigner : null;

  return {
    ethereumProvider,
    ethereumSigner,
    solanaConnection,
    solanaSigner,
    hasEthereumSigner: !!ethereumSigner,
    hasSolanaSigner: !!solanaSigner,
    areSignersInitialized: !!ethereumSigner || !!solanaSigner,
    isSignersLoading,
    isSignersError: isSignersError || isError,
    signersError:
      isError && data ? new Error((data as SignersError).error) : signersError,
    reinitializeSigners,
  };
};
