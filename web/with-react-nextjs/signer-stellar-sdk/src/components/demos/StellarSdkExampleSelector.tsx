"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useStellarWalletConnection } from "@/hooks/useStellarWalletConnection";

const transactionTypes = [
  {
    id: "sign-transaction",
    title: "Sign Transaction",
    description:
      "Build, sign, submit, and confirm a classic Stellar Testnet payment with Para's Stellar signer.",
    path: "/sign-transaction",
  },
  {
    id: "sign-message",
    title: "Sign Message",
    description:
      "Sign arbitrary bytes with Para's Stellar signer and verify the Ed25519 signature against the wallet key.",
    path: "/sign-message",
  },
  {
    id: "sign-auth-entry",
    title: "Sign Auth Entry",
    description:
      "Sign a Soroban authorization entry for smart contract interactions with Para's Stellar signer.",
    path: "/sign-auth-entry",
  },
];

export default function StellarSdkExampleSelector() {
  const wallet = useStellarWalletConnection();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mx-auto mb-10 max-w-3xl text-center animate-fade-in-up">
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-card-foreground">Para Stellar SDK</h1>
        <p className="text-[13px] font-mono leading-relaxed text-muted-foreground">
          Explore Stellar signing flows with Para. The reusable signer setup lives in
          <code className="mx-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground">
            /src/hooks/useParaSigner.ts
          </code>
          where the SDK Lite Stellar hook returns a
          <code className="ml-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground">
            ParaStellarSigner
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
