"use client";

import "@getpara/react-sdk/styles.css";
import { WalletDisplay } from "@/components/WalletDisplay";
import { ConnectButton } from "@getpara/rainbowkit";
import { useAccount } from "wagmi";
import "@getpara/rainbowkit/styles.css";

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Para + Rainbowkit Wallet Connector Example</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Para Modal with Rainbowkit Wallet Connector in a Next.js
        (App Router) project.
      </p>
      {isConnected ? <WalletDisplay walletAddress={address} /> : <p className="text-center">You are not logged in.</p>}
      <ConnectButton />
    </main>
  );
}
