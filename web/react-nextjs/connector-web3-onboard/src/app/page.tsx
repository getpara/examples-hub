"use client";

import { useConnectWallet } from "@web3-onboard/react";
import "@getpara/react-sdk/styles.css";
import { WalletDisplay } from "@/components/WalletDisplay";
import "@/client/web3-onboard";

export default function Home() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Para Modal + Web3 Onboard Wallet Connector Example</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Para Modal with the Web3 Onboard Wallet Connector in a
        Next.js (App Router) project.
      </p>
      {wallet ? (
        <WalletDisplay walletAddress={wallet.accounts[0].address} />
      ) : (
        <p className="text-center">You are not logged in.</p>
      )}
      <button
        disabled={connecting}
        onClick={() => (wallet ? disconnect(wallet) : connect())}
        className="rounded-none px-4 py-2 bg-blue-900 text-white hover:bg-blue-950">
        {connecting ? "Connecting..." : wallet ? "Disconnect Web3 Onboard" : "Connect Web3 Onboard"}
      </button>
    </main>
  );
}
