"use client";

import { usePara } from "@/components/ParaProvider";
import TokenSwapCard from "@/components/TokenSwapCard";

export default function Home() {
  const { isConnected, connection } = usePara();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Jupiter Dex API Demo with Para</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          This demonstrates how to use the Para SDK as the signer for Jupiter Dex API transactions.
        </p>
        {connection && (
          <p className="text-sm text-gray-500 mt-2">Connected to {isConnected ? "Solana network" : "no wallet"}.</p>
        )}
      </div>

      <div className="flex justify-center">
        <TokenSwapCard />
      </div>
    </div>
  );
}
