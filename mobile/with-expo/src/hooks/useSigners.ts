import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { Connection } from "@solana/web3.js";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { usePara } from "./usePara";
import { useWallets } from "./useWallets";
import { ALCHEMY_ETHEREUM_RPC_URL, ALCHEMY_SOLANA_RPC_URL } from "@/constants/envs";

interface SignersResult {
  ethereumProvider: ethers.JsonRpcProvider | null;
  ethereumSigner: ParaEthersSigner | null;
  solanaConnection: Connection | null;
  solanaSigner: ParaSolanaWeb3Signer | null;
}

const EMPTY_SIGNERS: SignersResult = {
  ethereumProvider: null,
  ethereumSigner: null,
  solanaConnection: null,
  solanaSigner: null,
};

export const useSigners = () => {
  const { paraClient, isAuthenticated, isClientReady } = usePara();
  const { hasEvmWallets, hasSolanaWallets } = useWallets();

  const {
    data = EMPTY_SIGNERS,
    isLoading: isSignersLoading,
    isError: isSignersError,
    error: signersError,
    refetch: reinitializeSigners,
  } = useQuery<SignersResult>({
    queryKey: ["blockchainSigners"],
    queryFn: async () => {
      if (!paraClient || !isAuthenticated) {
        throw new Error("Para client not initialized or not authenticated");
      }

      const result = { ...EMPTY_SIGNERS };

      if (hasEvmWallets && ALCHEMY_ETHEREUM_RPC_URL) {
        try {
          const provider = new ethers.JsonRpcProvider(ALCHEMY_ETHEREUM_RPC_URL);
          const signer = new ParaEthersSigner(paraClient, provider);
          result.ethereumProvider = provider;
          result.ethereumSigner = signer;
        } catch (error) {
          console.error("Error initializing Ethereum signer:", error);
        }
      }

      if (hasSolanaWallets && ALCHEMY_SOLANA_RPC_URL) {
        try {
          const connection = new Connection(ALCHEMY_SOLANA_RPC_URL, "confirmed");
          const signer = new ParaSolanaWeb3Signer(paraClient, connection);
          result.solanaConnection = connection;
          result.solanaSigner = signer;
        } catch (error) {
          console.error("Error initializing Solana signer:", error);
        }
      }

      if (!result.ethereumSigner && !result.solanaSigner && (hasEvmWallets || hasSolanaWallets)) {
        throw new Error("Failed to initialize any blockchain signers");
      }

      return result;
    },
    enabled: isClientReady && isAuthenticated && (hasEvmWallets || hasSolanaWallets),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });

  return {
    ethereumProvider: data.ethereumProvider,
    ethereumSigner: data.ethereumSigner,
    solanaConnection: data.solanaConnection,
    solanaSigner: data.solanaSigner,
    hasEthereumSigner: !!data.ethereumSigner,
    hasSolanaSigner: !!data.solanaSigner,
    areSignersInitialized: data !== EMPTY_SIGNERS,
    isSignersLoading,
    isSignersError,
    signersError,
    reinitializeSigners,
  };
};
