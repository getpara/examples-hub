"use client";

import { usePara } from "@/components/ParaProvider";
import { Card } from "@/components/Card";
import Link from "next/link";

const transactionTypes = [
  {
    id: "signMessage",
    title: "Sign Message",
    description: "Sign a message with your wallet",
    path: "src/example-tx/sign-message.tsx",
  },
  {
    id: "signTransaction",
    title: "Sign Transaction",
    description: "Sign a transaction without sending it",
    path: "src/example-tx/sign-transaction.tsx",
  },
];

export default function Home() {
  const { isConnected, openModal } = usePara();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Para Signing Demo</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore the different signing methods available with the Para client. You can sign directly using these
          methods or alternatively use on of our signer libraries for popular libraries like Ethers, CosmJS,
          Solana-Web3, and more.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-6xl mx-auto">
        {transactionTypes.map((type) => (
          <Card
            key={type.id}
            title={type.title}
            description={type.description}
            path={type.path}>
            {isConnected ? (
              <Link
                href={`/demo/${type.id}`}
                className="inline-flex w-full items-center justify-center rounded-none bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-950 transition-colors">
                View Demo
              </Link>
            ) : (
              <button
                onClick={openModal}
                className="w-full rounded-none bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-950 transition-colors">
                Connect Wallet
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
