"use client";

import { useState, useCallback } from "react";
import { erc20Abi, type Hex } from "viem";
import { getMeeScanLink, type MeeClient, type MultichainSmartAccount } from "@biconomy/abstractjs";
import { USDC_ADDRESS, DEFAULT_TRANSFER_AMOUNT, CHAIN } from "@/lib/biconomy";

export interface UseFusionTransferResult {
  executeTransfers: (recipients: string[]) => Promise<void>;
  isPending: boolean;
  status: string | null;
  meeScanLink: string | null;
  error: Error | null;
  reset: () => void;
}

export function useFusionTransfer(
  meeClient: MeeClient | null,
  orchestrator: MultichainSmartAccount | null
): UseFusionTransferResult {
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [meeScanLink, setMeeScanLink] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setIsPending(false);
    setStatus(null);
    setMeeScanLink(null);
    setError(null);
  }, []);

  const executeTransfers = useCallback(
    async (recipients: string[]) => {
      if (!orchestrator || !meeClient) {
        setError(new Error("MEE client not initialized. Please wait..."));
        return;
      }

      const validRecipients = recipients.filter((r) => r.trim().length > 0);
      if (validRecipients.length === 0) {
        setError(new Error("Please add at least one recipient."));
        return;
      }

      setIsPending(true);
      setError(null);
      setMeeScanLink(null);

      try {
        setStatus("Building transfer instructions...");

        // Build composable instructions for each transfer
        // These will be executed by the Companion Smart Account (orchestrator)
        const transfers = await Promise.all(
          validRecipients.map((recipient) =>
            orchestrator.buildComposable({
              type: "default",
              data: {
                abi: erc20Abi,
                chainId: CHAIN.id,
                to: USDC_ADDRESS,
                functionName: "transfer",
                args: [recipient as Hex, DEFAULT_TRANSFER_AMOUNT],
              },
            })
          )
        );

        const totalAmount = BigInt(transfers.length) * DEFAULT_TRANSFER_AMOUNT;

        setStatus("Simulating & requesting Fusion Quote...");

        // Fusion flow: The trigger authorizes the orchestrator to pull tokens from the EOA
        // This enables gas abstraction and batching with a single signature
        const fusionQuote = await meeClient.getFusionQuote({
          instructions: transfers,
          // Trigger pulls USDC from the user's EOA to the orchestrator
          trigger: {
            chainId: CHAIN.id,
            tokenAddress: USDC_ADDRESS,
            amount: totalAmount,
          },
          // Gas fees are paid in USDC (not ETH)
          feeToken: {
            address: USDC_ADDRESS,
            chainId: CHAIN.id,
          },
          // Enable simulation to get precise gas estimates and optimize costs
          simulation: {
            simulate: true,
          },
        });

        setStatus("Awaiting signature...");

        // Execute the fusion quote - user signs once to authorize everything
        const { hash } = await meeClient.executeFusionQuote({ fusionQuote });

        const link = getMeeScanLink(hash);
        setMeeScanLink(link);

        setStatus("Waiting for confirmation...");
        await meeClient.waitForSupertransactionReceipt({ hash });

        setStatus("Transaction confirmed!");
      } catch (err) {
        const errorMessage = err instanceof Error ? err : new Error("Failed to execute transfers");
        setError(errorMessage);
        setStatus(null);
      } finally {
        setIsPending(false);
      }
    },
    [meeClient, orchestrator]
  );

  return {
    executeTransfers,
    isPending,
    status,
    meeScanLink,
    error,
    reset,
  };
}

