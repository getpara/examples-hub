"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet, useClient } from "@getpara/react-sdk";
import { useViemAccount } from "@getpara/react-sdk/evm/hooks";
import { RhinestoneSDK, wrapParaAccount } from "@rhinestone/sdk";
import { formatUnits, type Account } from "viem";

export interface TokenBalance {
  symbol: string;
  totalBalance: string;
  lockedBalance: string;
  unlockedBalance: string;
  decimals: number;
  chains: Array<{
    chainId: number;
    chainName: string;
    balance: string;
    formattedBalance: string;
    lockedBalance: string;
    unlockedBalance: string;
    formattedLockedBalance: string;
    formattedUnlockedBalance: string;
  }>;
}

export interface GlobalWalletState {
  rhinestoneAccount: any | null;
  accountAddress: string | null;
  portfolio: TokenBalance[];
  isLoading: boolean;
  error: string | null;
}

export function useGlobalWallet() {
  const { data: wallet } = useWallet();
  const { viemAccount, isLoading: viemLoading } = useViemAccount();
  const para = useClient();
  const address = wallet?.address;
  // Connection is determined by having both wallet and viemAccount
  const isConnected = !!(wallet && viemAccount && !viemLoading);

  const [state, setState] = useState<GlobalWalletState>({
    rhinestoneAccount: null,
    accountAddress: null,
    portfolio: [],
    isLoading: false,
    error: null,
  });

  const getChainName = (chainId: number): string => {
    const chainNames: { [key: number]: string } = {
      1: "Ethereum",
      42161: "Arbitrum",
      8453: "Base",
      137: "Polygon",
      10: "Optimism",
      1868: "Autonomys",
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  };

  const fetchPortfolio = useCallback(
    async (account?: any) => {
      const rhinestoneAccount = account || state.rhinestoneAccount;
      if (!rhinestoneAccount) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const portfolio = await rhinestoneAccount.getPortfolio();

        const formattedPortfolio: TokenBalance[] = portfolio
          .map((token: any) => {
            // Handle actual API structure: token has symbol, decimals, balances, chains
            const totalLocked = BigInt(token.balances?.locked || 0);
            const totalUnlocked = BigInt(token.balances?.unlocked || 0);
            // Available balance is unlocked balance only
            const formattedAvailable = formatUnits(
              totalUnlocked,
              token.decimals
            );
            const formattedLocked = formatUnits(totalLocked, token.decimals);
            const formattedUnlocked = formatUnits(
              totalUnlocked,
              token.decimals
            );

            const chains = (token.chains || [])
              .map((chain: any) => {
                const chainLocked = BigInt(chain.locked || 0);
                const chainUnlocked = BigInt(chain.unlocked || 0);
                // Available balance per chain is unlocked balance only
                const formattedChainAvailable = formatUnits(
                  chainUnlocked,
                  token.decimals
                );
                const formattedChainLocked = formatUnits(
                  chainLocked,
                  token.decimals
                );
                const formattedChainUnlocked = formatUnits(
                  chainUnlocked,
                  token.decimals
                );

                return {
                  chainId: chain.chain,
                  chainName: getChainName(chain.chain),
                  balance: chainUnlocked.toString(), // Available balance
                  formattedBalance: formattedChainAvailable, // Available balance
                  lockedBalance: chainLocked.toString(),
                  unlockedBalance: chainUnlocked.toString(),
                  formattedLockedBalance: formattedChainLocked,
                  formattedUnlockedBalance: formattedChainUnlocked,
                };
              })
              .filter(
                (chain: any) =>
                  BigInt(chain.balance) > BigInt(0) ||
                  BigInt(chain.lockedBalance) > BigInt(0) ||
                  BigInt(chain.unlockedBalance) > BigInt(0)
              );

            const result = {
              symbol: token.symbol,
              totalBalance: formattedAvailable, // Show available balance as total
              lockedBalance: formattedLocked,
              unlockedBalance: formattedUnlocked,
              decimals: token.decimals,
              chains,
            };

            const hasBalance =
              totalUnlocked > BigInt(0) ||
              totalLocked > BigInt(0) ||
              chains.length > 0;

            return { ...result, hasBalance };
          })
          .filter((token: any) => {
            // Show tokens that have any balance (locked, unlocked, or on any chain)
            return token.hasBalance;
          })
          .map(({ hasBalance, ...token }: any) => {
            // Filter out the hasBalance property
            void hasBalance;
            return token;
          });

        setState((prev) => ({
          ...prev,
          portfolio: formattedPortfolio,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Failed to fetch portfolio:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch portfolio",
        }));
      }
    },
    [state.rhinestoneAccount]
  );

  const initializeRhinestoneAccount = useCallback(async () => {
    console.log("Attempting to initialize Rhinestone:", {
      hasAddress: !!address,
      hasViemAccount: !!viemAccount,
      hasPara: !!para,
      isConnected,
    });

    if (!address || !viemAccount || !para || !isConnected) {
      setState((prev) => ({
        ...prev,
        rhinestoneAccount: null,
        accountAddress: null,
        portfolio: [],
        error: null,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const rhinestone = new RhinestoneSDK({
        apiKey: "proxy",
        endpointUrl: `${baseUrl}/api/orchestrator`,
      });

      const walletId = wallet?.id;
      const wrappedAccount = wrapParaAccount(viemAccount, walletId);

      console.log("Creating Rhinestone account with wrapped Para signer...", {
        walletId,
        accountAddress: viemAccount?.address,
      });

      // Use the wrapped account for Rhinestone SDK
      const rhinestoneAccount = await rhinestone.createAccount({
        owners: {
          type: "ecdsa" as const,
          accounts: [wrappedAccount as Account],
        },
      });

      const accountAddress = rhinestoneAccount.getAddress();

      console.log("Rhinestone account created successfully:", accountAddress);

      setState((prev) => ({
        ...prev,
        rhinestoneAccount,
        accountAddress,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to initialize Rhinestone account:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize account",
      }));
    }
  }, [address, viemAccount, para, isConnected]);

  const sendCrossChainTransaction = useCallback(
    async (
      sourceChains: any[],
      targetChain: any,
      calls: any[],
      tokenRequests: any[]
    ) => {
      if (!state.rhinestoneAccount) {
        throw new Error("Rhinestone account not initialized");
      }

      try {
        const transaction = await state.rhinestoneAccount.sendTransaction({
          sourceChains,
          targetChain,
          calls,
          tokenRequests,
          sponsored: true,
        });

        // Wait for execution
        const result = await state.rhinestoneAccount.waitForExecution(
          transaction
        );

        // Extract transaction hash if available
        let fillTransactionHash = null;
        if (result && typeof result === "object") {
          if ("fillTransactionHash" in result) {
            fillTransactionHash = result.fillTransactionHash;
          } else if ("transactionHash" in result) {
            fillTransactionHash = result.transactionHash;
          }
        }

        // Refresh portfolio after transaction
        await fetchPortfolio();

        return {
          transaction,
          result,
          fillTransactionHash,
        };
      } catch (error) {
        console.error("Cross-chain transaction failed:", error);
        throw error;
      }
    },
    [state.rhinestoneAccount, fetchPortfolio]
  );

  useEffect(() => {
    initializeRhinestoneAccount();
  }, [initializeRhinestoneAccount]);

  // Fetch portfolio when rhinestone account is available
  useEffect(() => {
    if (state.rhinestoneAccount) {
      fetchPortfolio();
    }
  }, [state.rhinestoneAccount, fetchPortfolio]);

  return {
    ...state,
    address,
    isConnected: !!address && !!viemAccount && isConnected,
    refreshPortfolio: () => fetchPortfolio(),
    sendCrossChainTransaction,
  };
}
