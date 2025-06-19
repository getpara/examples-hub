import { useQuery } from "@tanstack/react-query";
import { NETWORK_CONFIG, SupportedNetwork } from "@/constants";
import { PublicKey } from "@solana/web3.js";
import { parseAbi, formatUnits, PublicClient } from "viem";
import { useSigners } from "./useSigners";

const ERC20_ABI = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
]);

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

interface UseTokenBalanceProps {
  network: SupportedNetwork | null;
}

export function useTokenBalance({ network }: UseTokenBalanceProps) {
  const { ethereumViem, baseViem, solanaSvm } = useSigners();

  const fetchBalance = async () => {
    if (!network) {
      return "0";
    }

    const config = NETWORK_CONFIG[network];

    let address: string | null = null;
    let publicClient: PublicClient | null = null;
    let connection = null;
    let isInitialized = false;

    switch (network) {
      case "ethereum":
        address = ethereumViem.address;
        publicClient = ethereumViem.publicClient;
        isInitialized = ethereumViem.isInitialized;
        break;
      case "base":
        address = baseViem.address;
        publicClient = baseViem.publicClient;
        isInitialized = baseViem.isInitialized;
        break;
      case "solana":
        address = solanaSvm.address;
        connection = solanaSvm.connection;
        isInitialized = solanaSvm.isInitialized;
        break;
    }

    if (!isInitialized || !address) {
      return "0";
    }

    if (config.networkCategory === "evm" && publicClient) {
      try {
        const balance = await publicClient.readContract({
          address: config.usdcContractAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        });
        return formatUnits(balance, 6);
      } catch (error) {
        console.error("Error fetching EVM balance:", error);
        return "0";
      }
    } else if (config.networkCategory === "svm" && connection) {
      try {
        const ownerPubkey = new PublicKey(address);
        const mintPubkey = new PublicKey(config.usdcContractAddress);

        const [associatedTokenAddress] = PublicKey.findProgramAddressSync(
          [ownerPubkey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintPubkey.toBuffer()],
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const accountInfo = await connection.getAccountInfo(associatedTokenAddress);

        if (!accountInfo) {
          return "0";
        }

        const dataBuffer = accountInfo.data;
        if (dataBuffer.length < 72) {
          return "0";
        }

        const balance = dataBuffer.readBigUInt64LE(64);
        return formatUnits(balance, 6);
      } catch (error) {
        console.error("Error fetching SVM balance:", error);
        return "0";
      }
    }

    return "0";
  };

  const isEnabled = (() => {
    if (!network) return false;

    switch (network) {
      case "ethereum":
        return ethereumViem.isInitialized;
      case "base":
        return baseViem.isInitialized;
      case "solana":
        return solanaSvm.isInitialized;
      default:
        return false;
    }
  })();

  const address = (() => {
    if (!network) return null;

    switch (network) {
      case "ethereum":
        return ethereumViem.address;
      case "base":
        return baseViem.address;
      case "solana":
        return solanaSvm.address;
      default:
        return null;
    }
  })();

  const query = useQuery({
    queryKey: ["tokenBalance", network, address],
    queryFn: fetchBalance,
    enabled: isEnabled,
    refetchInterval: 10000,
    staleTime: 5000,
  });

  return {
    balance: query.data || "0",
    isLoading: query.isLoading,
    error: query.error,
  };
}
