"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useSolanaWalletConnection } from "@/hooks/useSolanaWalletConnection";

const transactionTypes = [
  {
    id: "message-signing",
    title: "Message Signing",
    description:
      "Sign a message with your Para Solana account and verify the signature against the wallet public key.",
    path: "/message-signing",
  },
  {
    id: "sol-transfer",
    title: "SOL Transfer",
    description:
      "Send SOL on Devnet through an Anchor provider backed by Para's Solana web3.js signer.",
    path: "/sol-transfer",
  },
  {
    id: "program-create-token",
    title: "Program Create Token",
    description:
      "Call the sample Anchor program to create a token mint using Token-2022 accounts.",
    path: "/program-create-token",
  },
  {
    id: "program-mint-token",
    title: "Program Mint Token",
    description:
      "Interact with the deployed Anchor program to mint tokens to a Solana recipient account.",
    path: "/program-mint-token",
  },
];

export default function SolanaAnchorExampleSelector() {
  const wallet = useSolanaWalletConnection();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mx-auto mb-10 max-w-3xl text-center animate-fade-in-up">
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-card-foreground">
          Para Solana Anchor Signer
        </h1>
        <p className="text-[13px] font-mono leading-relaxed text-muted-foreground">
          Explore signing Solana messages, transfers, and Anchor program calls with Para. The reusable signer setup
          lives in
          <code className="mx-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground">
            /src/hooks/useParaSigner.ts
          </code>
          where the Para client becomes a
          <code className="ml-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground">
            ParaSolanaWeb3Signer
          </code>
          and Anchor provider.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
        {transactionTypes.map((transaction) => (
          <Card key={transaction.id} title={transaction.title} description={transaction.description}>
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
    </div>
  );
}
