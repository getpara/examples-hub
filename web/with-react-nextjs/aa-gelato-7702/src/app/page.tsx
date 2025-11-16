"use client";

import { useAccount, useModal } from "@getpara/react-sdk";
import { ConnectWalletCard } from "@/components/ui/ConnectWalletCard";
import { SponsoredTransaction } from "@/components/SponsoredTransaction";

export default function Home() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Gelato EIP-7702 Demo</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Experience gasless transactions with Gelato&apos;s smart account and EIP-7702.
          Connect your wallet to delegate execution and send sponsored transactions without ETH.
        </p>
      </div>

      {!isConnected ? (
        <ConnectWalletCard onConnect={openModal} />
      ) : (
        <div className="max-w-xl mx-auto">
          <SponsoredTransaction />
        </div>
      )}
    </div>
  );
}
