"use client";

import { Card } from "@/components/ui/Card";
import { useCosmosWalletConnection } from "@/hooks/useCosmosWalletConnection";
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
  const wallet = useCosmosWalletConnection();

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mx-auto mb-10 max-w-3xl text-center animate-fade-in-up">
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-card-foreground">
          Para CosmJS Signer
        </h1>
        <p className="text-[13px] font-mono leading-relaxed text-muted-foreground">
          Explore signing different transaction types using Para with CosmJS. Reference the
          <code className="mx-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground">
            /src/hooks/useParaSigner.ts
          </code>
          file to see how we integrate Para with CosmJS and create the Para-compatible
          <code className="ml-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground">
            SigningStargateClient
          </code>.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
        {transactionTypes.map((transaction) => (
          <Card
            key={transaction.id}
            title={transaction.title}
            description={transaction.description}>
            <div>
              {wallet.isConnected ? (
                <Link
                  href={transaction.path}
                  className="btn-primary inline-flex w-full items-center justify-center px-4 py-2.5 text-sm">
                  View Demo
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => wallet.openModal()}
                  className="btn-primary w-full px-4 py-2.5 text-sm">
                  Connect Wallet
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
