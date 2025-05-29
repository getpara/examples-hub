import { useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Execute, type ProgressData } from "@reservoir0x/relay-sdk";
import { adaptSolanaWallet } from "@reservoir0x/relay-solana-wallet-adapter";
import { useRelayClient } from "./useRelayClient";
import { useSigners } from "./useSigners";
import { NETWORK_CONFIG, SupportedNetwork } from "@/constants";
import { parseUnits } from "viem";

interface QuoteParams {
  originNetwork: SupportedNetwork | null;
  destNetwork: SupportedNetwork | null;
  amount: string;
  originAddress: string | null;
  destAddress: string | null;
}

export function useRelayBridge() {
  const relayClient = useRelayClient();
  const { ethereumViem, baseViem, solanaSvm } = useSigners();

  const getNetworkClients = useCallback(
    (network: SupportedNetwork) => {
      switch (network) {
        case "ethereum":
          return ethereumViem;
        case "base":
          return baseViem;
        case "solana":
          return solanaSvm;
        default:
          throw new Error(`Unsupported network: ${network}`);
      }
    },
    [ethereumViem, baseViem, solanaSvm]
  );

  const fetchQuote = async (params: QuoteParams): Promise<Execute> => {
    const { originNetwork, destNetwork, amount, originAddress, destAddress } = params;

    if (!relayClient) throw new Error("Relay client not initialized");
    if (!originNetwork || !destNetwork) throw new Error("Networks not selected");
    if (!originAddress || !destAddress) throw new Error("Wallets not connected");
    if (!amount || parseFloat(amount) <= 0) throw new Error("Invalid amount");

    const originConfig = NETWORK_CONFIG[originNetwork];
    const destConfig = NETWORK_CONFIG[destNetwork];
    const amountInWei = parseUnits(amount, 6).toString();

    const quoteParams = {
      chainId: originConfig.chainId as number,
      toChainId: destConfig.chainId as number,
      currency: originConfig.usdcContractAddress,
      toCurrency: destConfig.usdcContractAddress,
      amount: amountInWei,
      user: originAddress,
      recipient: destAddress,
      tradeType: "EXACT_INPUT" as const,
    };

    const quoteResponse = await relayClient.actions.getQuote(quoteParams);

    return quoteResponse;
  };

  const useQuote = (params: QuoteParams) => {
    return useQuery<Execute>({
      queryKey: ["relayQuote", params],
      queryFn: () => fetchQuote(params),
      enabled: !!(
        relayClient &&
        params.originNetwork &&
        params.destNetwork &&
        params.amount &&
        parseFloat(params.amount) > 0 &&
        params.originAddress &&
        params.destAddress &&
        params.originNetwork !== params.destNetwork
      ),
      staleTime: 25000,
      gcTime: 30000,
      refetchInterval: 25000,
      refetchOnWindowFocus: true,
    });
  };

  const executeMutation = useMutation({
    mutationFn: async ({
      quote,
      originNetwork,
      onProgress,
    }: {
      quote: Execute;
      originNetwork: SupportedNetwork;
      onProgress?: (update: ProgressData) => void;
    }) => {
      if (!relayClient) throw new Error("Relay client not initialized");
      if (!quote) throw new Error("Invalid quote");

      const originConfig = NETWORK_CONFIG[originNetwork];
      const originClients = getNetworkClients(originNetwork);
      console.log("Origin clients:", originClients);
      let wallet;

      if (originConfig.networkCategory === "evm") {
        if (!("walletClient" in originClients) || !originClients.walletClient) {
          throw new Error("EVM wallet not initialized");
        }
        wallet = originClients.walletClient;
      } else if (originConfig.networkCategory === "svm") {
        if (
          !("signer" in originClients) ||
          !originClients.signer ||
          !originClients.connection ||
          !originClients.address
        ) {
          throw new Error("Solana wallet not initialized");
        }

        wallet = adaptSolanaWallet(
          originClients.address,
          originConfig.chainId,
          originClients.connection,
          async (transaction, options) => {
            const signature = await originClients.signer!.sendTransaction(transaction, options);
            return { signature };
          }
        );
      } else {
        throw new Error("Unsupported network category");
      }

      await relayClient.actions.execute({
        quote,
        wallet,
        onProgress,
      });

      return true;
    },
  });

  return {
    useQuote,
    executeBridge: executeMutation.mutate,
    isExecuting: executeMutation.isPending,
    executeError: executeMutation.error,
  };
}
