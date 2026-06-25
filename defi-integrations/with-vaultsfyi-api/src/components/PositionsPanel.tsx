"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { sdk } from "@/lib/vaultsFyi";
import { usePositions } from "@/hooks/usePositions";
import { useExecuteAction } from "@/hooks/useExecuteAction";
import { Card } from "./Card";

export function PositionsPanel({ userAddress }: { userAddress: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = usePositions(userAddress);
  const {
    running,
    step,
    hashes,
    error: execError,
    execute,
  } = useExecuteAction();
  const [redeeming, setRedeeming] = useState<string | null>(null);

  async function handleRedeem(p: NonNullable<typeof data>["data"][number]) {
    setRedeeming(p.vaultId);
    try {
      const { currentActionIndex, actions } = await sdk.getActions({
        path: {
          action: "redeem",
          userAddress,
          network: p.network.name,
          vaultId: p.vaultId,
        },
        query: { assetAddress: p.asset.address, all: true },
      });
      await execute(currentActionIndex, actions);
      await refetch();
      await queryClient.invalidateQueries({
        queryKey: ["transactionContext"],
      });
    } finally {
      setRedeeming(null);
    }
  }

  return (
    <Card
      title="Your positions"
      subtitle="Read directly from on-chain state across every protocol vaults.fyi covers, including positions opened outside this app."
    >
      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
      {error && (
        <p className="text-sm text-red-600">{(error as Error).message}</p>
      )}
      {data?.data.length === 0 && (
        <p className="text-sm text-gray-500">No positions yet.</p>
      )}
      <div className="space-y-2">
        {data?.data.map((p) => (
          <div
            key={`${p.network.name}-${p.vaultId}`}
            className="flex items-center justify-between p-3 border border-gray-200"
          >
            <div className="text-left min-w-0">
              <div className="text-sm text-gray-900 font-medium truncate">
                {p.protocol.name} · {p.name}
              </div>
              <div className="text-xs text-gray-500">
                {p.network.name} · {p.lpToken?.balanceUsd ?? "?"} USD ·{" "}
                {(p.apy.total * 100).toFixed(2)}% APY
              </div>
            </div>
            <button
              onClick={() => handleRedeem(p)}
              disabled={running || redeeming === p.vaultId}
              className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-900 px-3 py-2 disabled:opacity-50"
            >
              {redeeming === p.vaultId
                ? `Redeeming…${step ? ` (${step.current}/${step.total})` : ""}`
                : "Redeem all"}
            </button>
          </div>
        ))}
      </div>
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
      {execError && <p className="mt-3 text-sm text-red-600">{execError}</p>}
    </Card>
  );
}
