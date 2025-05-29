import { useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSquidClient } from "./useSquidClient";
import { useSigners } from "./useSigners";
import { NETWORK_CONFIG, SupportedNetwork } from "@/constants";
import { ethers, TransactionResponse } from "ethers";
import {
  DepositAddressResponse,
  GetStatus,
  OnChainExecutionData,
  RouteResponse,
  SolanaTxResponse,
  TransactionResponses,
} from "@0xsquid/sdk/dist/types";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";

interface QuoteParams {
  originNetwork: SupportedNetwork | null;
  destNetwork: SupportedNetwork | null;
  amount: string;
  originAddress: string | null;
  destAddress: string | null;
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
      quoteOnly: true,
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

  const simulateTransaction = async (
    route: RouteResponse["route"],
    provider: ethers.JsonRpcProvider,
    from: string
  ): Promise<{ success: boolean; error?: any }> => {
    try {
      if (!route.transactionRequest) {
        console.warn("No transactionRequest in route, skipping simulation");
        return { success: true };
      }
      if ("request" in route.transactionRequest) {
        return { success: true };
      }

      if ("target" in route.transactionRequest && "data" in route.transactionRequest) {
        const tx = route.transactionRequest as OnChainExecutionData;

        if (!tx.target || !tx.data) {
          throw new Error("Invalid transaction data: missing target or data");
        }

        const callParams: ethers.TransactionRequest = {
          to: tx.target,
          data: tx.data,
          from: from,
        };

        if (tx.value && tx.value !== "0") {
          callParams.value = tx.value;
        }

        if (tx.gasLimit) {
          callParams.gasLimit = tx.gasLimit;
        }

        if (tx.maxFeePerGas && tx.maxPriorityFeePerGas) {
          callParams.maxFeePerGas = tx.maxFeePerGas;
          callParams.maxPriorityFeePerGas = tx.maxPriorityFeePerGas;
        } else if (tx.gasPrice) {
          callParams.gasPrice = tx.gasPrice;
        }

        await provider.call(callParams);
        return { success: true };
      }

      console.warn("Unknown transaction request type, proceeding without simulation");
      return { success: true };
    } catch (error) {
      console.error("Transaction simulation failed:", error);
      return { success: false, error };
    }
  };

  const getTransactionHash = (tx: TransactionResponses, originNetwork: SupportedNetwork): string => {
    const networkCategory = NETWORK_CONFIG[originNetwork].networkCategory;

    if (networkCategory === "evm") {
      const ethTx = tx as TransactionResponse;
      return ethTx.hash;
    } else if (networkCategory === "svm") {
      const solanaTx = tx as SolanaTxResponse;
      return solanaTx.tx;
    } else if ("depositAddress" in tx) {
      const depositTx = tx as DepositAddressResponse;
      return depositTx.chainflipStatusTrackingId;
    } else if ("bodyBytes" in tx) {
      const cosmosTx = tx as TxRaw;
      const txBytes = cosmosTx.bodyBytes;
      const hash = ethers.keccak256(txBytes);
      return hash;
    }

    return "unknown";
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

        const simulation = await simulateTransaction(quote.route, provider, address);
        if (!simulation.success) {
          throw new Error("Transaction simulation failed");
        }

        const tx = await squid.executeRoute({
          signer,
          route: quote.route,
        });

        const txHash = getTransactionHash(tx, originNetwork);

        if (onProgress) {
          const pollStatus = async () => {
            try {
              const statusParams: GetStatus = {
                transactionId: txHash,
                requestId: quote.requestId,
                integratorId: quote.integratorId,
              };

              const status = await squid.getStatus(statusParams);

              const squidStatus = status.squidTransactionStatus;

              if (squidStatus === "success") {
                onProgress({
                  steps: [{ items: [{ status: "complete" }] }],
                  currentStep: { id: "complete" },
                  txHashes: [{ txHash }],
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

          if (originConfig.networkCategory === "evm" && "wait" in tx && typeof tx.wait === "function") {
            tx.wait().then(() => {
              clearInterval(checkInterval);
              pollStatus();
            });
          } else {
            setTimeout(() => {
              clearInterval(checkInterval);
              pollStatus();
            }, 60000);
          }
        }

        return tx;
      } else if (originConfig.networkCategory === "svm") {
        // Type guard to check if this is a Solana client
        if (!("connection" in originClients) || !originClients.connection || !originClients.signer) {
          throw new Error("Solana wallet not initialized");
        }

        const solanaSigner = originClients.signer;
        const connection = originClients.connection;
        const address = originClients.address;

        if (!address || !solanaSigner.sender) {
          throw new Error("No Solana address found");
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

        const txHash = getTransactionHash(tx, originNetwork);

        if (onProgress) {
          onProgress({
            steps: [{ items: [{ status: "pending" }] }],
            currentStep: { id: "deposit" },
            txHashes: [{ txHash }],
          });

          const pollStatus = async () => {
            try {
              const statusParams: GetStatus = {
                transactionId: txHash,
                requestId: quote.requestId,
                integratorId: quote.integratorId,
              };

              const status = await squid.getStatus(statusParams);
              const squidStatus = status.squidTransactionStatus;

              if (squidStatus === "success") {
                onProgress({
                  steps: [{ items: [{ status: "complete" }] }],
                  currentStep: { id: "complete" },
                  txHashes: [{ txHash }],
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

              onProgress({
                steps: [{ items: [{ status: "pending" }] }],
                currentStep: { id: "fill" },
                txHashes: [{ txHash }],
              });

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

          setTimeout(() => {
            clearInterval(checkInterval);
            pollStatus();
          }, 180000);
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
