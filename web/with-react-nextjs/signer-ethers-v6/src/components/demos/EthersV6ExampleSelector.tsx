"use client";

import { Card } from "@/components/ui/Card";
import { useEvmWalletConnection } from "@/hooks/useEvmWalletConnection";
import Link from "next/link";

const transactionTypes = [
  {
    id: "message-signing",
    title: "Message Signing",
    description:
      "Sign a message with your Para account to prove ownership of an address. This is commonly used for authentication and verifying wallet ownership.",
    path: "/message-signing",
  },
  {
    id: "eth-transfer",
    title: "ETH Transfer",
    description:
      "Send ETH from one address to another. Learn how to handle basic ETH transfers, gas estimation, and transaction confirmation.",
    path: "/eth-transfer",
  },
  {
    id: "contract-deployment",
    title: "Contract Deployment",
    description:
      "Deploy your own instance of the ParaTestToken contract. Learn about contract bytecode, constructor arguments, and deployment transactions.",
    path: "/contract-deployment",
  },
  {
    id: "token-transfer",
    title: "Token Transfer",
    description:
      "Transfer ERC20 tokens between addresses using our ParaTestToken contract. Understand token decimals, allowances, and balances.",
    path: "/token-transfer",
  },
  {
    id: "contract-interaction",
    title: "Contract Interaction",
    description:
      "Interact with deployed ParaTestToken contract functions. Explore different types of contract calls, state changes, and error handling.",
    path: "/contract-interaction",
  },
  {
    id: "batch-transactions",
    title: "Batch Transactions",
    description:
      "Execute multiple token operations in a single transaction using Multicall. Save gas and ensure atomic execution of related operations.",
    path: "/batch-transactions",
  },
  {
    id: "typed-data-signing",
    title: "Typed Data Signing",
    description:
      "Sign structured data using EIP-712. This is commonly used in DEXs and marketplaces for signing orders and permissions.",
    path: "/typed-data-signing",
  },
  {
    id: "permit-signing",
    title: "Permit Signing",
    description:
      "Create permits for token approvals without requiring a separate transaction. Learn about EIP-2612 permit signatures and gasless approvals.",
    path: "/permit-signing",
  },
];

export default function EthersV6ExampleSelector() {
  const wallet = useEvmWalletConnection();

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mx-auto mb-10 max-w-3xl text-center animate-fade-in-up">
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-card-foreground">
          Para Ethers v6 Signer
        </h1>
        <p className="text-[13px] font-mono leading-relaxed text-muted-foreground">
          Explore signing different transaction types using Para with Ethers.js v6. Reference the
          <code className="mx-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground">
            /src/hooks/useParaSigner.ts
          </code>
          file to see how we integrate Para with ethers v6 and create a Para-compatible
          <code className="ml-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground">
            ParaEthersSigner
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
