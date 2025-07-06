"use client";

import { useAccount, useModal } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

const transactionTypes = [
  {
    id: "message-signing",
    title: "Message Signing",
    description:
      "Sign arbitrary messages with your Cosmos account. This is commonly used for authentication and verifying wallet ownership.",
    path: "/message-signing",
  },
  {
    id: "atom-transfer",
    title: "ATOM Transfer",
    description:
      "Send ATOM from one address to another. Learn how to handle basic token transfers, gas estimation, and transaction confirmation.",
    path: "/atom-transfer",
  },
  {
    id: "ibc-transfer",
    title: "IBC Transfer",
    description:
      "Transfer tokens across different Cosmos chains using the Inter-Blockchain Communication protocol.",
    path: "/ibc-transfer",
  },
  {
    id: "staking",
    title: "Staking & Delegation",
    description:
      "Delegate ATOM to validators, claim staking rewards, and manage your delegations on the Cosmos Hub.",
    path: "/staking",
  },
  {
    id: "governance",
    title: "Governance Voting",
    description:
      "Participate in Cosmos governance by voting on proposals. Learn about proposal types and voting power.",
    path: "/governance",
  },
  {
    id: "cosmwasm-interaction",
    title: "CosmWasm Contract",
    description:
      "Interact with CosmWasm smart contracts. Execute contract methods, query state, and handle contract responses.",
    path: "/cosmwasm-interaction",
  },
];

export default function Home() {
  const account = useAccount();
  const { openModal } = useModal();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Para + CosmJS Demo</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore signing different transaction types using Para with CosmJS. Reference the
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-md ml-1 mr-1">
            /src/hooks/useParaSigner.ts
          </code>
          file to see how we integrate Para with CosmJS and create the Para-compatible
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-md ml-1">SigningStargateClient</code>.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {transactionTypes.map((transaction) => (
          <Card
            key={transaction.id}
            title={transaction.title}
            description={transaction.description}
            path={transaction.path}>
            <div>
              {account?.isConnected ? (
                <Link
                  href={transaction.path}
                  className="inline-flex w-full items-center justify-center rounded-none bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-950 transition-colors mt-auto">
                  View Demo
                </Link>
              ) : (
                <button
                  onClick={() => openModal()}
                  className="w-full rounded-none bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-950 transition-colors mt-auto">
                  Connect Wallet
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}