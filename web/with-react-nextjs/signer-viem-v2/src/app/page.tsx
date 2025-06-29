"use client";

import { useAccount, useModal } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

const transactionTypes = [
  {
    id: "eth-transfer",
    title: "ETH Transfer",
    description:
      "Send ETH from one address to another. Learn how to handle basic ETH transfers, gas estimation, and transaction confirmation.",
    path: "/eth-transfer",
  },
  {
    id: "message-signing",
    title: "Message Signing",
    description:
      "Sign a message with your Para account to prove ownership of an address. This is commonly used for authentication and verifying wallet ownership.",
    path: "/message-signing",
  },
  {
    id: "token-transfer",
    title: "Token Transfer",
    description:
      "Transfer ERC20 tokens between addresses using our ParaTestToken contract. Understand token decimals, allowances, and balances.",
    path: "/token-transfer",
  },
  {
    id: "contract-deployment",
    title: "Contract Deployment",
    description:
      "Deploy your own instance of the ParaTestToken contract. Learn about contract bytecode, constructor arguments, and deployment transactions.",
    path: "/contract-deployment",
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

export default function Home() {
  const account = useAccount();
  const { openModal } = useModal();
  const isConnected = account.data?.isConnected ?? false;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Para + Viem v2 Demo</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore signing different transaction types using Para with Viem v2. Reference the
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-md">
            /src/context/ParaProvider.tsx
          </code>
          file to see how we provide Para globally to the app and create the Para compatible
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-md">WalletClient</code>.
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
              {isConnected ? (
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