"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWallet } from "@getpara/react-sdk";
import { useParaViemAccount } from "@getpara/react-sdk/evm";
import {
  RhinestoneSDK,
  type CallInput,
  type Portfolio,
  type RhinestoneAccount,
  type TokenRequest,
  type TransactionResult,
} from "@rhinestone/sdk";
import type { Account, Chain } from "viem";
import { SUPPORTED_CHAIN_NAMES } from "@/lib/rhinestone";

interface UseRhinestoneGlobalWalletOptions {
  enabled?: boolean;
}

interface CrossChainTransactionInput {
  sourceChains: Chain[];
  targetChain: Chain;
  calls: CallInput[];
  tokenRequests: Array<TokenRequest & { amount: bigint }>;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error("Rhinestone account setup failed.");
}

function getEndpointUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/orchestrator`;
  }

  return `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/orchestrator`;
}

export function useRhinestoneGlobalWallet({
  enabled = true,
}: UseRhinestoneGlobalWalletOptions = {}) {
  const { data: wallet } = useWallet();
  const { viemAccount, isLoading: isViemLoading } = useParaViemAccount();
  const [rhinestoneAccount, setRhinestoneAccount] = useState<RhinestoneAccount | null>(null);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const rhinestone = useMemo(
    () =>
      new RhinestoneSDK({
        apiKey: "proxy",
        endpointUrl: getEndpointUrl(),
      }),
    []
  );

  const refreshPortfolio = useCallback(
    async (account = rhinestoneAccount) => {
      if (!account) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        setPortfolio(await account.getPortfolio());
      } catch (portfolioError) {
        setError(toError(portfolioError));
      } finally {
        setIsLoading(false);
      }
    },
    [rhinestoneAccount]
  );

  useEffect(() => {
    async function createGlobalWallet() {
      if (!enabled || !wallet?.address || !viemAccount || isViemLoading) {
        setRhinestoneAccount(null);
        setAccountAddress(null);
        setPortfolio([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const account = await rhinestone.createAccount({
          owners: {
            type: "ecdsa",
            accounts: [viemAccount as Account],
          },
        });

        setRhinestoneAccount(account);
        setAccountAddress(account.getAddress());
        setPortfolio(await account.getPortfolio());
      } catch (accountError) {
        setRhinestoneAccount(null);
        setAccountAddress(null);
        setPortfolio([]);
        setError(toError(accountError));
      } finally {
        setIsLoading(false);
      }
    }

    createGlobalWallet();
  }, [enabled, isViemLoading, rhinestone, viemAccount, wallet?.address]);

  const sendCrossChainTransaction = useCallback(
    async ({
      sourceChains,
      targetChain,
      calls,
      tokenRequests,
    }: CrossChainTransactionInput): Promise<TransactionResult> => {
      if (!rhinestoneAccount) {
        throw new Error("Rhinestone account is not ready.");
      }

      const transaction = await rhinestoneAccount.sendTransaction({
        sourceChains,
        targetChain,
        calls,
        tokenRequests,
        sponsored: true,
      });

      await rhinestoneAccount.waitForExecution(transaction);
      await refreshPortfolio(rhinestoneAccount);
      return transaction;
    },
    [refreshPortfolio, rhinestoneAccount]
  );

  return {
    accountAddress,
    portfolio,
    isLoading: isLoading || isViemLoading,
    error,
    supportedChains: SUPPORTED_CHAIN_NAMES,
    refreshPortfolio: () => refreshPortfolio(),
    sendCrossChainTransaction,
  };
}
