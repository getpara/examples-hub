"use client";

import { useCapsule } from "@/components/CapsuleProvider";
import { Card } from "@/components/Card";
import Link from "next/link";
import { transactionTypes } from "@/example-transactions";

export default function Home() {
  const { isConnected, openModal } = useCapsule();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Capsule Signing Demo</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore the different signing methods available with the Capsule client. You can sign directly using these
          methods or alternatively use on of our signer libraries for popular libraries like Ethers, CosmJS,
          Solana-Web3, and more.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {Object.entries(transactionTypes).map(([id, transaction]) => (
          <Card
            key={id}
            title={transaction.title}
            description={transaction.description}
            path={transaction.path}>
            <div>
              {isConnected ? (
                <Link
                  href={`/demo/${id}`}
                  className="inline-flex w-full items-center justify-center rounded-none bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-950 transition-colors mt-auto">
                  View Demo
                </Link>
              ) : (
                <button
                  onClick={openModal}
                  className="w-full rounded-none bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-950 transition-colors mt-auto">
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
