"use client";

import "@usecapsule/react-sdk/styles.css";
import { WalletDisplay } from "@/components/WalletDisplay";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function Home() {
  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  //Note: we filter the connectors to only show the Capsule connector
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Capsule + Cosmos Example</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Capsule Modal with Rainbowkit Wallet Connector in a
        Next.js (App Router) project.
      </p>
      {isConnected ? <WalletDisplay walletAddress={address} /> : <p className="text-center">You are not logged in.</p>}
      {connectors
        .filter((connector) => connector.id === "capsule")
        .map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            className="rounded-none px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
            Connect with {connector.name}
          </button>
        ))}
    </main>
  );
}
