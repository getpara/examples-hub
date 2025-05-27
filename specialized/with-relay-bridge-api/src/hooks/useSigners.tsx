import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, useClient } from "@getpara/react-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { createPublicClient, http, PublicClient, WalletClient } from "viem";
import { sepolia, baseSepolia } from "viem/chains";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { Connection } from "@solana/web3.js";
import { NETWORK_CONFIG } from "@/constants";

interface SignerData {
  ethereumViem: {
    publicClient: PublicClient | null;
    walletClient: WalletClient | null;
    address: string | null;
    isInitialized: boolean;
  };
  baseViem: {
    publicClient: PublicClient | null;
    walletClient: WalletClient | null;
    address: string | null;
    isInitialized: boolean;
  };
  solanaSvm: {
    signer: ParaSolanaWeb3Signer | null;
    connection: Connection | null;
    address: string | null;
    isInitialized: boolean;
  };
}

const SIGNERS_QUERY_KEY = ["globalSigners"];

async function initializeSigners(para: any, account: any): Promise<SignerData> {
  const signerData: SignerData = {
    ethereumViem: { publicClient: null, walletClient: null, address: null, isInitialized: false },
    baseViem: { publicClient: null, walletClient: null, address: null, isInitialized: false },
    solanaSvm: { signer: null, connection: null, address: null, isInitialized: false },
  };

  if (!para || !account?.isConnected) {
    return signerData;
  }

  try {
    const ethereumChain = sepolia;
    const ethereumConfig = NETWORK_CONFIG.ethereum;
    const ethereumAccount = createParaAccount(para);
    const ethereumWalletClient = createParaViemClient(para, {
      account: ethereumAccount,
      chain: ethereumChain,
      transport: http(ethereumConfig.rpcUrl),
    });
    const ethereumPublicClient = createPublicClient({
      chain: ethereumChain,
      transport: http(ethereumConfig.rpcUrl),
    });

    signerData.ethereumViem = {
      walletClient: ethereumWalletClient,
      publicClient: ethereumPublicClient as PublicClient,
      address: ethereumAccount.address,
      isInitialized: true,
    };
  } catch (error) {
    console.error("[Global Signers] Ethereum initialization error:", error);
  }

  // Initialize Base signer
  try {
    const baseChain = baseSepolia;
    const baseConfig = NETWORK_CONFIG.base;
    const baseAccount = createParaAccount(para);
    const baseWalletClient = createParaViemClient(para, {
      account: baseAccount,
      chain: baseChain,
      transport: http(baseConfig.rpcUrl),
    });
    const basePublicClient = createPublicClient({
      chain: baseChain,
      transport: http(baseConfig.rpcUrl),
    });

    signerData.baseViem = {
      walletClient: baseWalletClient,
      publicClient: basePublicClient as PublicClient,
      address: baseAccount.address,
      isInitialized: true,
    };
  } catch (error) {
    console.error("[Global Signers] Base initialization error:", error);
  }

  try {
    const solanaConfig = NETWORK_CONFIG.solana;
    const solanaConnection = new Connection(solanaConfig.rpcUrl, "confirmed");
    const solanaSigner = new ParaSolanaWeb3Signer(para, solanaConnection);
    const publicKey = await solanaSigner.sender;

    if (publicKey) {
      signerData.solanaSvm = {
        signer: solanaSigner,
        connection: solanaConnection,
        address: publicKey.toBase58(),
        isInitialized: true,
      };
    }
  } catch (error) {
    console.error("[Global Signers] Solana initialization error:", error);
  }

  return signerData;
}

export function useSigners() {
  const para = useClient();
  const { data: account } = useAccount();
  const queryClient = useQueryClient();

  const {
    data: signers = {
      ethereumViem: { publicClient: null, walletClient: null, address: null, isInitialized: false },
      baseViem: { publicClient: null, walletClient: null, address: null, isInitialized: false },
      solanaSvm: { signer: null, connection: null, address: null, isInitialized: false },
    } as SignerData,
  } = useQuery({
    queryKey: [...SIGNERS_QUERY_KEY, account?.isConnected],
    queryFn: () => initializeSigners(para, account),
    enabled: !!para && !!account?.isConnected,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const clearSigners = () => {
    queryClient.setQueryData(SIGNERS_QUERY_KEY, {
      ethereumViem: { publicClient: null, walletClient: null, address: null, isInitialized: false },
      baseViem: { publicClient: null, walletClient: null, address: null, isInitialized: false },
      solanaSvm: { signer: null, connection: null, address: null, isInitialized: false },
    });
  };

  return {
    ...signers,
    clearSigners,
  };
}
