"use client";

import Link from "next/link";
import { useAccount, useModal } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";

const transactionTypes = [
  {
    id: "sign-transaction",
    title: "Sign Transaction",
    description:
      "Build and sign a classic Stellar payment transaction. Fund your account via Friendbot and send XLM on testnet.",
    path: "/sign-transaction",
  },
  {
    id: "sign-message",
    title: "Sign Message",
    description:
      "Sign arbitrary bytes with signBytes() and verify the Ed25519 signature. Useful for authentication and off-chain verification.",
    path: "/sign-message",
  },
  {
    id: "sign-auth-entry",
    title: "Sign Auth Entry",
    description:
      "Sign a Soroban authorization entry. This demonstrates the signAuthEntry capability for Soroban smart contract interactions.",
    path: "/sign-auth-entry",
  },
];

export default function Home() {
  const { openModal } = useModal();
  const account = useAccount();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Para + Stellar SDK</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore signing different transaction types using Para with the Stellar SDK. Reference the
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">
            /src/hooks/useParaSigner.ts
          </code>
          file to see how we use the
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">useStellarSigner</code>
          hook from Para.
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
