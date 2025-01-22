"use client";

import "@usecapsule/react-sdk/styles.css";
import { WalletDisplay } from "@/components/WalletDisplay";
import { ConnectButton } from "@usecapsule/rainbowkit";
import { useAccount } from "wagmi";
import "@usecapsule/rainbowkit/styles.css";

export default function Home() {
  const { address, addresses, status, isConnected, isConnecting, connector } = useAccount();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Capsule + Rainbowkit Wallet Connector Example</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Capsule Modal with Rainbowkit Wallet Connector in a
        Next.js (App Router) project.
      </p>
      {isConnected ? <WalletDisplay walletAddress={address} /> : <p className="text-center">You are not logged in.</p>}
      <ConnectButton />
    </main>
  );
}
