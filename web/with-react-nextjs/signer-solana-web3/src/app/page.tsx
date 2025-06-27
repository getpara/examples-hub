"use client";

import Link from "next/link";
import { useAccount, useModal } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";

const transactionTypes = [
  {
    id: "message-signing",
    title: "Message Signing",
    description: "Sign a message with your Para account. This is used for signing arbitrary data and off-chain messages.",
    path: "/message-signing",
  },
  {
    id: "sol-transfer",
    title: "SOL Transfer",
    description: "Send SOL from one address to another. Learn how to handle basic SOL transfers, gas estimation, and transaction confirmation.",
    path: "/sol-transfer",
  },
];

export default function Home() {
  const { openModal } = useModal();
  const { data: account } = useAccount();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Para + Solana-Web3.js</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore signing different transaction types using Para with Solana-Web3.js. Reference the
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">
            /src/hooks/useParaSigner.tsx
          </code>
          file to see how we provide Para globally to the app and create the
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">ParaSolanaWeb3Signer</code>.
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
