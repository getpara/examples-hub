import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, useWallet, useClient } from "@getpara/react-sdk";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ethers } from "ethers";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { Connection } from "@solana/web3.js";
import { NETWORK_CONFIG } from "@/config/constants";

interface SignerData {
  ethereumEthers: {
    provider: ethers.JsonRpcProvider | null;
    signer: ParaEthersSigner | null;
    address: string | null;
    isInitialized: boolean;
  };
  baseEthers: {
    provider: ethers.JsonRpcProvider | null;
    signer: ParaEthersSigner | null;
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

async function initializeSigners(para: any): Promise<SignerData> {
  const signerData: SignerData = {
    ethereumEthers: { provider: null, signer: null, address: null, isInitialized: false },
    baseEthers: { provider: null, signer: null, address: null, isInitialized: false },
    solanaSvm: { signer: null, connection: null, address: null, isInitialized: false },
  };

  if (!para) {
    return signerData;
  }

  try {
    const ethereumConfig = NETWORK_CONFIG.ethereum;
    const ethereumProvider = new ethers.JsonRpcProvider(ethereumConfig.rpcUrl);
    const ethereumSigner = new ParaEthersSigner(para, ethereumProvider);
    const ethereumAddress = await ethereumSigner.getAddress();

    signerData.ethereumEthers = {
      provider: ethereumProvider,
      signer: ethereumSigner,
      address: ethereumAddress,
      isInitialized: true,
    };
  } catch (error) {
    console.error("[Global Signers] Ethereum initialization error:", error);
  }

  try {
    const baseConfig = NETWORK_CONFIG.base;
    const baseProvider = new ethers.JsonRpcProvider(baseConfig.rpcUrl);
    const baseSigner = new ParaEthersSigner(para, baseProvider);
    const baseAddress = await baseSigner.getAddress();

    signerData.baseEthers = {
      provider: baseProvider,
      signer: baseSigner,
      address: baseAddress,
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
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const queryClient = useQueryClient();

  const {
    data: signers = {
      ethereumEthers: { provider: null, signer: null, address: null, isInitialized: false },
      baseEthers: { provider: null, signer: null, address: null, isInitialized: false },
      solanaSvm: { signer: null, connection: null, address: null, isInitialized: false },
    } as SignerData,
  } = useQuery({
    queryKey: [...SIGNERS_QUERY_KEY, isConnected],
    queryFn: () => initializeSigners(para),
    enabled: !!para && !!isConnected,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const clearSigners = () => {
    queryClient.setQueryData(SIGNERS_QUERY_KEY, {
      ethereumEthers: { provider: null, signer: null, address: null, isInitialized: false },
      baseEthers: { provider: null, signer: null, address: null, isInitialized: false },
      solanaSvm: { signer: null, connection: null, address: null, isInitialized: false },
    });
  };

  return {
    ...signers,
    clearSigners,
  };
}
