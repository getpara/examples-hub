"use client";

import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { sdk } from "@/lib/vaultsFyi";
import type { VaultOption } from "@/hooks/useDepositOptions";
import { useExecuteAction } from "@/hooks/useExecuteAction";
import { useTransactionContext } from "@/hooks/useTransactionContext";
import { VAULTSFYI_NETWORK } from "@/config/constants";
import { Card } from "./Card";

const USDC_DECIMALS = 6;
const DEFAULT_AMOUNT = "1"; // 1 USDC

export function ActionPanel({
  userAddress,
  selected,
}: {
  userAddress: string;
  selected: VaultOption;
}) {
  const queryClient = useQueryClient();
  const { running, step, hashes, error, execute, reset } = useExecuteAction();
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [preparing, setPreparing] = useState(false);

  const { data: ctx, isLoading: ctxLoading } = useTransactionContext(
    userAddress,
    VAULTSFYI_NETWORK,
    selected.vaultId,
  );

  const balance = ctx?.asset.balanceNative;
  const balanceFormatted = balance
    ? formatUnits(BigInt(balance), USDC_DECIMALS)
    : undefined;

  const parsedAmount = (() => {
    try {
      return parseUnits(amount.replace(",", "."), USDC_DECIMALS);
    } catch {
      return null;
    }
  })();

  const exceedsBalance =
    parsedAmount !== null && balance
      ? parsedAmount > BigInt(balance)
      : false;

  const depositDisabled =
    preparing ||
    running ||
    !amount ||
    parsedAmount === null ||
    parsedAmount <= 0n ||
    exceedsBalance;

  function handleMax() {
    if (balanceFormatted) {
      setAmount(balanceFormatted);
    }
  }

  async function handleDeposit() {
    setPreparing(true);
    reset();
    try {
      const { currentActionIndex, actions } = await sdk.getActions({
        path: {
          action: "deposit",
          userAddress,
          network: VAULTSFYI_NETWORK,
          vaultId: selected.vaultId,
        },
        query: {
          assetAddress: selected.asset.address,
          amount: parseUnits(
            amount.replace(",", "."),
            USDC_DECIMALS,
          ).toString(),
        },
      });
      await execute(currentActionIndex, actions);
      await queryClient.invalidateQueries({ queryKey: ["positions"] });
      await queryClient.invalidateQueries({
        queryKey: ["transactionContext"],
      });
    } finally {
      setPreparing(false);
    }
  }

  return (
    <Card
      title={`Deposit into ${selected.name}`}
      subtitle={`${selected.protocol.name} · ${(
        selected.apy["7day"].total * 100
      ).toFixed(2)}% APY · ${selected.address}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full bg-white text-gray-900 text-sm border pl-3 pr-24 py-2 ${
              exceedsBalance ? "border-red-400" : "border-gray-300"
            }`}
            placeholder="Amount in USDC"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={handleMax}
              disabled={!balanceFormatted}
              className="text-xs text-blue-700 hover:text-blue-900 font-medium disabled:opacity-30"
            >
              MAX
            </button>
            <span className="text-xs text-gray-500">USDC</span>
          </span>
        </div>
        <button
          onClick={handleDeposit}
          disabled={depositDisabled}
          className="bg-blue-900 text-white font-semibold px-4 py-2 hover:bg-blue-950 disabled:opacity-50"
        >
          {preparing || running
            ? `Depositing…${step ? ` (${step.current}/${step.total})` : ""}`
            : "Deposit"}
        </button>
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {ctxLoading
          ? "Loading balance…"
          : balanceFormatted !== undefined
            ? `Balance: ${balanceFormatted} USDC`
            : ""}
      </div>
      {exceedsBalance && (
        <p className="mt-1 text-xs text-red-600">
          Amount exceeds your balance.
        </p>
      )}
      {hashes.length > 0 && (
        <ul className="mt-4 space-y-1 text-xs">
          {hashes.map((h) => (
            <li key={h.hash}>
              <a
                href={`https://basescan.org/tx/${h.hash}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 hover:underline"
              >
                {h.hash}
              </a>{" "}
              <span className="text-gray-500">({h.name})</span>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </Card>
  );
}
