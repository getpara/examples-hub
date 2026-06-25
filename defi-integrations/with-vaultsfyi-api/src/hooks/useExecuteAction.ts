"use client";

import { useCallback, useState } from "react";
import { useSigners } from "./useSigners";

type ActionStep = {
  name: string;
  tx: { to: string; chainId: number; data?: string; value?: string };
};

export type TxRecord = { hash: string; name: string };

export type ExecuteState = {
  running: boolean;
  step: { current: number; total: number } | null;
  hashes: TxRecord[];
  error: string | null;
};

const initial: ExecuteState = {
  running: false,
  step: null,
  hashes: [],
  error: null,
};

/**
 * Executes an ordered list of vaults.fyi action steps with the connected
 * Para wallet, waiting for each transaction receipt before proceeding.
 *
 * Vaults.fyi returns `actions[]` with raw `tx.to`, `tx.data`, `tx.value`,
 * `tx.chainId` per step. We submit each via the Para-backed viem walletClient
 * (which delegates signing to the user's MPC shares).
 */
export function useExecuteAction() {
  const [state, setState] = useState<ExecuteState>(initial);
  const { base } = useSigners();

  const execute = useCallback(
    async (currentActionIndex: number, actions: ActionStep[]) => {
      if (!base.isInitialized || !base.walletClient || !base.publicClient) {
        setState({
          ...initial,
          error: "Wallet not ready. Sign in with Para first.",
        });
        return;
      }

      const remaining = actions.slice(currentActionIndex);
      if (remaining.length === 0) {
        setState({ ...initial, error: "Nothing to execute." });
        return;
      }

      setState({ running: true, step: null, hashes: [], error: null });
      const hashes: TxRecord[] = [];

      try {
        for (let i = 0; i < remaining.length; i++) {
          const step = remaining[i];
          setState((s) => ({
            ...s,
            step: { current: i + 1, total: remaining.length },
          }));
          const hash = await base.walletClient.sendTransaction({
            account: base.walletClient.account!,
            chain: base.walletClient.chain,
            to: step.tx.to as `0x${string}`,
            data: step.tx.data as `0x${string}` | undefined,
            value: step.tx.value ? BigInt(step.tx.value) : undefined,
          });
          await base.publicClient.waitForTransactionReceipt({
            hash,
            confirmations: 2,
          });
          hashes.push({ hash, name: step.name });
        }
        setState({ running: false, step: null, hashes, error: null });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        setState({ running: false, step: null, hashes, error: message });
      }
    },
    [base],
  );

  const reset = useCallback(() => setState(initial), []);

  return { ...state, execute, reset };
}
