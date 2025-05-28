import { useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSquidClient } from "./useSquidClient";
import { useSigners } from "./useSigners";
import { NETWORK_CONFIG, SupportedNetwork } from "@/constants";
import { parseUnits } from "viem";
import { ethers } from "ethers";

interface QuoteParams {
  originNetwork: SupportedNetwork | null;
  destNetwork: SupportedNetwork | null;
  amount: string;
  originAddress: string | null;
  destAddress: string | null;
}

interface RouteResponse {
  route: any;
  requestId: string;
  quoteId: string;
}

export function useSquidBridge() {
  const squid = useSquidClient();
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

  const fetchQuote = async (params: QuoteParams): Promise<RouteResponse> => {
    const { originNetwork, destNetwork, amount, originAddress, destAddress } = params;

    if (!squid) throw new Error("Squid client not initialized");
    if (!originNetwork || !destNetwork) throw new Error("Networks not selected");
    if (!originAddress || !destAddress) throw new Error("Wallets not connected");
    if (!amount || parseFloat(amount) <= 0) throw new Error("Invalid amount");

    const originConfig = NETWORK_CONFIG[originNetwork];
    const destConfig = NETWORK_CONFIG[destNetwork];
    const amountInWei = parseUnits(amount, 6).toString();

    const squidParams = {
      fromChain: originConfig.chainId,
      toChain: destConfig.chainId,
      fromToken: originConfig.usdcContractAddress,
      toToken: destConfig.usdcContractAddress,
      fromAmount: amountInWei,
      fromAddress: originAddress,
      toAddress: destAddress,
      slippage: 1,
      quoteOnly: true,
    };

    const { route, requestId } = await squid.getRoute(squidParams);
    const quoteId = route.quoteId || "";

    return { route, requestId, quoteId };
  };

  const useQuote = (params: QuoteParams) => {
    return useQuery<RouteResponse>({
      queryKey: ["squidQuote", params],
      queryFn: () => fetchQuote(params),
      enabled: !!(
        squid &&
        params.originNetwork &&
        params.destNetwork &&
        params.amount &&
        parseFloat(params.amount) > 0 &&
        params.originAddress &&
        params.destAddress &&
        params.originNetwork !== params.destNetwork
      ),
      staleTime: 20000,
      refetchInterval: 20000,
      refetchOnWindowFocus: true,
    });
  };

  const simulateTransaction = async (route: any, signer: any) => {
    try {
      const provider = signer.provider || signer;
      const tx = route.transactionRequest;

      await provider.call({
        to: tx.target || tx.targetAddress,
        data: tx.data,
        value: tx.value,
        from: signer.address,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const executeMutation = useMutation({
    mutationFn: async ({
      quote,
      originNetwork,
      onProgress,
    }: {
      quote: RouteResponse;
      originNetwork: SupportedNetwork;
      onProgress?: (status: any) => void;
    }) => {
      if (!squid) throw new Error("Squid client not initialized");
      if (!quote?.route) throw new Error("Invalid quote");

      const originClients = getNetworkClients(originNetwork);
      const originConfig = NETWORK_CONFIG[originNetwork];
      let signer;

      if (originConfig.networkCategory === "evm") {
        if (!("walletClient" in originClients) || !originClients.walletClient) {
          throw new Error("EVM wallet not initialized");
        }

        const walletClient = originClients.walletClient;
        const provider = new ethers.providers.JsonRpcProvider(originConfig.rpcUrl);

        signer = new ethers.Wallet(await walletClient.account.signMessage({ message: "dummy" }), provider);
      } else {
        throw new Error("Solana support needs implementation");
      }

      const simulation = await simulateTransaction(quote.route, signer);
      if (!simulation.success) {
        throw new Error("Transaction simulation failed");
      }

      const tx = await squid.executeRoute({
        signer,
        route: quote.route,
      });

      if (onProgress) {
        const pollStatus = async () => {
          try {
            const status = await squid.getStatus({
              transactionId: tx.hash,
              requestId: quote.requestId,
              fromChainId: originConfig.chainId,
              toChainId: quote.route.params.toChain,
              quoteId: quote.quoteId,
            });

            const squidStatus = status.squidTransactionStatus;

            if (squidStatus === "success") {
              onProgress({
                steps: [{ items: [{ status: "complete" }] }],
                currentStep: { id: "complete" },
              });
              return true;
            } else if (squidStatus === "partial_success" || squidStatus === "refund" || squidStatus === "not_found") {
              onProgress({
                error: { message: `Transaction ${squidStatus}` },
                currentStep: { id: "failed" },
              });
              return true;
            } else if (squidStatus === "needs_gas") {
              onProgress({
                error: { message: "Transaction needs more gas" },
                currentStep: { id: "failed" },
              });
              return true;
            }

            return false;
          } catch (error) {
            console.error("Status check error:", error);
            return false;
          }
        };

        const checkInterval = setInterval(async () => {
          const isDone = await pollStatus();
          if (isDone) {
            clearInterval(checkInterval);
          }
        }, 5000);

        tx.wait().then(() => {
          clearInterval(checkInterval);
          pollStatus();
        });
      }

      return tx;
    },
  });

  return {
    useQuote,
    executeBridge: executeMutation.mutate,
    isExecuting: executeMutation.isPending,
    executeError: executeMutation.error,
  };
}
