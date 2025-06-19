import { useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSquidClient } from "./useSquidClient";
import { useSigners } from "./useSigners";
import { NETWORK_CONFIG, SupportedNetwork } from "@/constants";
import { ethers, TransactionResponse } from "ethers";
import { DepositAddressResponse, RouteResponse, SolanaTxResponse, TransactionResponses } from "@0xsquid/sdk/dist/types";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Transaction, VersionedTransaction, Connection } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";

interface QuoteParams {
  originNetwork: SupportedNetwork | null;
  destNetwork: SupportedNetwork | null;
  amount: string;
  originAddress: string | null;
  destAddress: string | null;
}

interface TransactionHashResult {
  hash: string;
  isChainflip?: boolean;
}

export function useSquidBridge() {
  const squid = useSquidClient();
  const { ethereumEthers, baseEthers, solanaSvm } = useSigners();

  const getNetworkClients = useCallback(
    (network: SupportedNetwork) => {
      switch (network) {
        case "ethereum":
          return ethereumEthers;
        case "base":
          return baseEthers;
        case "solana":
          return solanaSvm;
        default:
          throw new Error(`Unsupported network: ${network}`);
      }
    },
    [ethereumEthers, baseEthers, solanaSvm]
  );

  const fetchQuote = async (params: QuoteParams): Promise<RouteResponse> => {
    const { originNetwork, destNetwork, amount, originAddress, destAddress } = params;

    if (!squid) throw new Error("Squid client not initialized");
    if (!originNetwork || !destNetwork) throw new Error("Networks not selected");
    if (!originAddress || !destAddress) throw new Error("Wallets not connected");
    if (!amount || parseFloat(amount) <= 0) throw new Error("Invalid amount");

    const originConfig = NETWORK_CONFIG[originNetwork];
    const destConfig = NETWORK_CONFIG[destNetwork];
    const amountInWei = ethers.parseUnits(amount, 6).toString();

    const squidParams = {
      fromChain: originConfig.chainId.toString(),
      toChain: destConfig.chainId.toString(),
      fromToken: originConfig.usdcContractAddress,
      toToken: destConfig.usdcContractAddress,
      fromAmount: amountInWei,
      fromAddress: originAddress,
      toAddress: destAddress,
      slippage: 1,
      quoteOnly: false,
      enableBoost: true,
    };

    const response = await squid.getRoute(squidParams);
    return response;
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

  const simulateEvmTransaction = async (
    route: RouteResponse["route"],
    provider: ethers.JsonRpcProvider,
    from: string
  ): Promise<{ success: boolean; error?: any }> => {
    try {
      if (!route.transactionRequest) {
        console.warn("No transactionRequest in route, skipping simulation");
        return { success: true };
      }

      const tx = route.transactionRequest;

      if (!("targetAddress" in tx) || !("data" in tx)) {
        console.warn("Missing targetAddress or data in transactionRequest");
        return { success: true };
      }

      const result = await provider.send("eth_call", [
        {
          to: tx.targetAddress,
          data: tx.data,
          value: tx.value || "0x0",
          gas: tx.gasLimit,
          from: from,
        },
        "latest",
      ]);

      return { success: true };
    } catch (error) {
      console.error("EVM transaction simulation failed:", error);
      return { success: false, error };
    }
  };

  const simulateSolanaTransaction = async (
    route: RouteResponse["route"],
    connection: Connection
  ): Promise<{ success: boolean; error?: any }> => {
    try {
      if (!route.transactionRequest) {
        console.warn("No transaction request for Solana simulation");
        return { success: true };
      }

      if ("depositAddress" in route.transactionRequest) {
        console.warn("Chainflip deposit address transaction, skipping simulation");
        return { success: true };
      }

      if (!("data" in route.transactionRequest)) {
        console.warn("No transaction data for Solana simulation");
        return { success: true };
      }

      const txData = route.transactionRequest.data;
      const tx = VersionedTransaction.deserialize(Buffer.from(txData, "base64"));

      const simulation = await connection.simulateTransaction(tx, {
        commitment: "processed",
        replaceRecentBlockhash: true,
      });

      if (simulation.value.err) {
        return { success: false, error: simulation.value.err };
      }

      return { success: true };
    } catch (error) {
      console.error("Solana transaction simulation failed:", error);
      return { success: false, error };
    }
  };

  const getTransactionHash = (tx: TransactionResponses, originNetwork: SupportedNetwork): TransactionHashResult => {
    const networkCategory = NETWORK_CONFIG[originNetwork].networkCategory;

    if (networkCategory === "evm") {
      const ethTx = tx as TransactionResponse;
      return { hash: ethTx.hash };
    } else if (networkCategory === "svm") {
      const solanaTx = tx as SolanaTxResponse;
      return { hash: solanaTx.tx };
    } else if ("depositAddress" in tx) {
      const depositTx = tx as DepositAddressResponse;
      return { hash: depositTx.chainflipStatusTrackingId, isChainflip: true };
    } else if ("bodyBytes" in tx) {
      const cosmosTx = tx as TxRaw;
      const txBytes = cosmosTx.bodyBytes;
      const hash = ethers.keccak256(txBytes);
      return { hash };
    }

    return { hash: "unknown" };
  };

  const executeMutation = useMutation({
    mutationFn: async ({
      quote,
      originNetwork,
      destNetwork,
      onProgress,
    }: {
      quote: RouteResponse;
      originNetwork: SupportedNetwork;
      destNetwork: SupportedNetwork;
      onProgress?: (status: any) => void;
    }) => {
      if (!squid) throw new Error("Squid client not initialized");
      if (!quote?.route) throw new Error("Invalid quote");

      const originClients = getNetworkClients(originNetwork);
      const originConfig = NETWORK_CONFIG[originNetwork];

      // Helper function for status polling with improved error handling
      const createStatusPoller = (txHashResult: TransactionHashResult, estimatedDuration: number) => {
        if (!onProgress) return null;

        let notFoundRetries = 0;
        const MAX_NOT_FOUND_RETRIES = 3;

        const pollStatus = async () => {
          try {
            if (txHashResult.isChainflip) {
              console.warn("Chainflip transaction detected. Status tracking may be limited.");
            }

            const statusParams: any = {
              transactionId: txHashResult.hash,
              requestId: quote.requestId,
              integratorId: quote.integratorId,
            };

            const quoteId = (quote.route as any).quoteId || (quote as any).quoteId;
            if (quoteId) {
              statusParams.quoteId = quoteId;
            }

            const status = await squid.getStatus(statusParams);
            const squidStatus = status.squidTransactionStatus;

            if (squidStatus === "success") {
              onProgress?.({
                steps: [{ items: [{ status: "complete" }] }],
                currentStep: { id: "complete" },
                txHashes: [{ txHash: txHashResult.hash }],
              });
              return true;
            }

            if (squidStatus === "partial_success") {
              onProgress?.({
                error: {
                  message:
                    "Transaction partially completed. Funds received on destination chain but final swap may have failed. Please check your destination wallet.",
                },
                currentStep: { id: "partial" },
                txHashes: [{ txHash: txHashResult.hash }],
              });
              return true;
            }

            if (squidStatus === "refund") {
              onProgress?.({
                error: {
                  message:
                    "Transaction failed and funds have been refunded to your wallet. This may take up to 10 minutes.",
                },
                currentStep: { id: "refunded" },
                txHashes: [{ txHash: txHashResult.hash }],
              });
              return true;
            }

            if (squidStatus === "not_found") {
              notFoundRetries++;
              if (notFoundRetries >= MAX_NOT_FOUND_RETRIES) {
                onProgress?.({
                  error: {
                    message:
                      "Transaction not found after multiple attempts. Please check the transaction hash on a block explorer.",
                  },
                  currentStep: { id: "failed" },
                  txHashes: [{ txHash: txHashResult.hash }],
                });
                return true;
              }
              return false;
            }

            if (squidStatus === "needs_gas") {
              onProgress?.({
                error: {
                  message:
                    "Transaction needs more gas to complete. Please visit Axelarscan to add gas to your transaction.",
                },
                currentStep: { id: "needs_gas" },
                axelarScanUrl: status.axelarTransactionUrl,
                txHashes: [{ txHash: txHashResult.hash }],
              });
              return true;
            }

            if (squidStatus === "ongoing") {
              onProgress?.({
                steps: [{ items: [{ status: "pending" }] }],
                currentStep: { id: "processing" },
                txHashes: [{ txHash: txHashResult.hash }],
              });
              return false;
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

        const maxWaitTime = Math.max(15 * 60 * 1000, estimatedDuration * 2 * 1000);

        setTimeout(() => {
          clearInterval(checkInterval);
          onProgress?.({
            error: {
              message: "Transaction timeout. Please check the transaction status manually.",
            },
            currentStep: { id: "timeout" },
            txHashes: [{ txHash: txHashResult.hash }],
          });
        }, maxWaitTime);

        return checkInterval;
      };

      if (originConfig.networkCategory === "evm") {
        if (
          !("provider" in originClients) ||
          !("signer" in originClients) ||
          !originClients.signer ||
          !originClients.provider
        ) {
          throw new Error("EVM wallet not initialized");
        }

        const signer = originClients.signer;
        const provider = originClients.provider;
        const address = originClients.address;

        if (!address) {
          throw new Error("No address found");
        }

        const simulation = await simulateEvmTransaction(quote.route, provider, address);
        if (!simulation.success) {
          throw new Error("Transaction simulation failed");
        }

        const tx = await squid.executeRoute({
          signer,
          route: quote.route,
        });

        const txHashResult = getTransactionHash(tx, originNetwork);

        if (onProgress) {
          const estimatedDuration = quote.route.estimate?.estimatedRouteDuration || 960;
          const checkInterval = createStatusPoller(txHashResult, estimatedDuration);

          if ("wait" in tx && typeof tx.wait === "function") {
            tx.wait().then(() => {
              if (checkInterval) clearInterval(checkInterval);
              createStatusPoller(txHashResult, estimatedDuration);
            });
          }
        }

        return tx;
      } else if (originConfig.networkCategory === "svm") {
        if (!("connection" in originClients) || !originClients.connection || !originClients.signer) {
          throw new Error("Solana wallet not initialized");
        }

        const solanaSigner = originClients.signer;
        const connection = originClients.connection;
        const address = originClients.address;

        if (!address || !solanaSigner.sender) {
          throw new Error("No Solana address found");
        }

        const simulation = await simulateSolanaTransaction(quote.route, connection);
        if (!simulation.success) {
          throw new Error(`Solana transaction simulation failed: ${JSON.stringify(simulation.error)}`);
        }

        const solanaWallet = {
          publicKey: solanaSigner.sender,
          signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
            return await solanaSigner.signTransaction(tx);
          },
          signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
            return await Promise.all(txs.map((tx) => solanaSigner.signTransaction(tx)));
          },
        };

        const tx = await squid.executeRoute({
          signer: solanaWallet as Wallet,
          route: quote.route,
          signerAddress: address,
        });

        const txHashResult = getTransactionHash(tx, originNetwork);

        if (onProgress) {
          onProgress({
            steps: [{ items: [{ status: "pending" }] }],
            currentStep: { id: "deposit" },
            txHashes: [{ txHash: txHashResult.hash }],
          });

          const estimatedDuration = quote.route.estimate?.estimatedRouteDuration || 180;
          createStatusPoller(txHashResult, estimatedDuration);
        }

        return tx;
      } else {
        throw new Error("Unsupported network category");
      }
    },
  });

  return {
    useQuote,
    executeBridge: executeMutation.mutate,
    isExecuting: executeMutation.isPending,
    executeError: executeMutation.error,
  };
}
