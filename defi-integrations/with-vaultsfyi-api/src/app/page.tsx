"use client";

import { useState } from "react";
import { useAccount, useModal } from "@getpara/react-sdk";
import { useSigners } from "@/hooks/useSigners";
import type { VaultOption } from "@/hooks/useDepositOptions";
import { DiscoverPanel } from "@/components/DiscoverPanel";
import { ActionPanel } from "@/components/ActionPanel";
import { PositionsPanel } from "@/components/PositionsPanel";
import { RewardsPanel } from "@/components/RewardsPanel";

export default function Home() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { base } = useSigners();
  const [selected, setSelected] = useState<VaultOption | null>(null);

  // Address from the viem account derived from the Para client (the same
  // pattern Relay's useSigners uses — `useWallet().data.address` is also
  // available but the viem account address is what every downstream tx
  // actually signs with, so it's the one to display and pass to the API).
  const address = base.address ?? undefined;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          vaults.fyi Yield Demo with Para
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          This demonstrates how to use the Para SDK as the signer for vaults.fyi
          deposit, redeem, and reward-claim transactions across 1,000+ DeFi
          vaults.
        </p>
      </div>

      {!isConnected && (
        <div className="flex justify-center mb-8">
          <button
            onClick={() => openModal()}
            className="px-6 py-3 bg-blue-900 text-white font-semibold rounded-none hover:bg-blue-950 transition-colors"
          >
            Sign in with Para
          </button>
        </div>
      )}

      <div className="space-y-6">
        <DiscoverPanel
          userAddress={address}
          onSelect={(vault) => setSelected(vault)}
        />
        {isConnected && address && selected && (
          <ActionPanel userAddress={address} selected={selected} />
        )}
        {isConnected && address && (
          <>
            <PositionsPanel userAddress={address} />
            <RewardsPanel userAddress={address} />
          </>
        )}
      </div>
    </div>
  );
}
