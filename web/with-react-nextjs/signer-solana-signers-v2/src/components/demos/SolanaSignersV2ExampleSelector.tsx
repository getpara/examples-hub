"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useSolanaWalletConnection } from "@/hooks/useSolanaWalletConnection";

const transactionTypes = [
  {
    id: "message-signing",
    title: "Message Signing",
    description:
      "Sign a message with Para's Solana Signers v2 integration and verify the signature against the wallet key.",
    path: "/message-signing",
  },
  {
    id: "sol-transfer",
    title: "SOL Transfer",
    description:
      "Build, sign, submit, and confirm a Solana Devnet transfer with the Signers v2 transaction flow.",
    path: "/sol-transfer",
  },
];

export default function SolanaSignersV2ExampleSelector() {
  const wallet = useSolanaWalletConnection();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mx-auto mb-10 max-w-3xl text-center animate-fade-in-up">
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-card-foreground">
          Para Solana Signers v2
        </h1>
        <p className="text-[13px] font-mono leading-relaxed text-muted-foreground">
          Explore Solana message signing and SOL transfers with Para. The reusable signer setup lives in
          <code className="mx-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground">
            /src/hooks/useParaSigner.ts
          </code>
          where the Para wallet becomes a Solana
          <code className="ml-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground">
            ParaSolanaSigner
          </code>
          .
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
