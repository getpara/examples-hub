"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useSuiWalletConnection } from "@/hooks/useSuiWalletConnection";

const transactionTypes = [
  {
    id: "sign-transaction",
    title: "Sign Transaction",
    description:
      "Build, sign, execute, and confirm a Sui Testnet SUI transfer with Para's Sui signer over gRPC.",
    path: "/sign-transaction",
  },
  {
    id: "sign-message",
    title: "Sign Message",
    description:
      "Sign a personal message with Para's Sui signer and verify the Ed25519 signature against the wallet key.",
    path: "/sign-message",
  },
  {
    id: "multisig",
    title: "Native Multisig",
    description:
      "Build a 2-of-2 Sui multisig from the Para wallet + a co-signer, then combine partial signatures.",
    path: "/multisig",
  },
];

export default function SuiSdkExampleSelector() {
  const wallet = useSuiWalletConnection();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mx-auto mb-10 max-w-3xl text-center animate-fade-in-up">
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-card-foreground">Para Sui SDK</h1>
        <p className="text-[13px] font-mono leading-relaxed text-muted-foreground">
          Explore Sui signing flows with Para. The reusable signer setup lives in
          <code className="mx-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground">
            /src/hooks/useParaSigner.ts
          </code>
          where the SDK Lite Sui hook returns a
          <code className="ml-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground">
            ParaSuiSigner
          </code>
          .
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
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
