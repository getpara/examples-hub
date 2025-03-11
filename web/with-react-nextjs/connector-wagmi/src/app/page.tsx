"use client";

import "@getpara/react-sdk/styles.css";
import { WalletDisplay } from "@/components/WalletDisplay";
import { useAccount } from "wagmi";
import { WalletConnectors } from "@/components/WalletConnectors";

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Para + Wagmi Example</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Para Modal using the Wagmi SDK in a Next.js (App Router)
        project.
      </p>
      <p className="max-w-md text-center">
        Use the Wagmi SDK when you're trying to create your own custom wallet connection modal.
      </p>
      {isConnected ? <WalletDisplay walletAddress={address} /> : <WalletConnectors />}
    </main>
  );
}
