"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { sdk } from "@/lib/vaultsFyi";
import { useRewards } from "@/hooks/useRewards";
import { useExecuteAction } from "@/hooks/useExecuteAction";
import { VAULTSFYI_NETWORK } from "@/config/constants";
import { Card } from "./Card";

export function RewardsPanel({ userAddress }: { userAddress: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useRewards(userAddress);
  const { running, step, hashes, error, execute } = useExecuteAction();
  const [preparing, setPreparing] = useState(false);

  const networkRewards = data?.claimable[VAULTSFYI_NETWORK] ?? [];
  const totalUsd = networkRewards.reduce(
    (sum, r) => sum + parseFloat(r.asset.claimableAmountInUsd ?? "0"),
    0,
  );

  async function handleClaim() {
    if (networkRewards.length === 0) return;
    setPreparing(true);
    try {
      const claimIds = networkRewards.map((r) => r.claimId);
      const claim = await sdk.getRewardsClaimActions({
        path: { userAddress },
        query: { claimIds },
      });
      const networkClaim = claim[VAULTSFYI_NETWORK];
      if (!networkClaim || networkClaim.actions.length === 0) return;
      await execute(networkClaim.currentActionIndex, networkClaim.actions);
      await refetch();
      await queryClient.invalidateQueries({
        queryKey: ["transactionContext"],
      });
    } finally {
      setPreparing(false);
    }
  }

  return (
    <Card
      title="Claimable rewards on Base"
      subtitle="Two-step flow: discover claimIds, then sign the per-network claim transactions."
    >
      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
      {!isLoading && networkRewards.length === 0 && (
        <p className="text-sm text-gray-500">No claimable rewards.</p>
      )}
      {networkRewards.length > 0 && (
        <>
          <ul className="space-y-1 text-sm text-gray-700 mb-4">
            {networkRewards.map((r) => (
              <li key={r.claimId}>
                {r.asset.claimableAmount} {r.asset.symbol}
                {r.asset.claimableAmountInUsd
                  ? ` (${r.asset.claimableAmountInUsd} USD)`
                  : ""}
                {" · "}
                <span className="text-gray-500">
                  {r.sources.map((s) => s.protocol.name).join(", ")}
                </span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleClaim}
            disabled={preparing || running}
            className="bg-blue-900 text-white font-semibold px-4 py-2 hover:bg-blue-950 disabled:opacity-50"
          >
            {preparing || running
              ? `Claiming…${step ? ` (${step.current}/${step.total})` : ""}`
              : `Claim ${totalUsd.toFixed(2)} USD`}
          </button>
        </>
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
