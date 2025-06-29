"use client";

import { useModal, useAccount } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

const transactionTypes = {
  "message-signing": {
    title: "Message Signing",
    description:
      "Sign a message with your Para account to prove ownership of an address. This is commonly used for authentication and verifying wallet ownership.",
    path: "/message-signing",
  },
  "eth-transfer": {
    title: "ETH Transfer",
    description:
      "Send ETH from one address to another. Learn how to handle basic ETH transfers, gas estimation, and transaction confirmation.",
    path: "/eth-transfer",
  },
  "contract-deployment": {
    title: "Contract Deployment",
    description:
      "Deploy your own instance of the ParaTestToken contract. Learn about contract bytecode, constructor arguments, and deployment transactions.",
    path: "/contract-deployment",
  },
  "token-transfer": {
    title: "Token Transfer",
    description:
      "Transfer ERC20 tokens between addresses using our ParaTestToken contract. Understand token decimals, allowances, and balances.",
    path: "/token-transfer",
  },
  "contract-interaction": {
    title: "Contract Interaction",
    description:
      "Interact with deployed ParaTestToken contract functions. Explore different types of contract calls, state changes, and error handling.",
    path: "/contract-interaction",
  },
  "batch-transactions": {
    title: "Batch Transactions",
    description:
      "Execute multiple token operations in a single transaction using Multicall. Save gas and ensure atomic execution of related operations.",
    path: "/batch-transactions",
  },
  "typed-data-signing": {
    title: "Typed Data Signing",
    description:
      "Sign structured data using EIP-712. This is commonly used in DEXs and marketplaces for signing orders and permissions.",
    path: "/typed-data-signing",
  },
  "permit-signing": {
    title: "Permit Signing",
    description:
      "Create permits for token approvals without requiring a separate transaction. Learn about EIP-2612 permit signatures and gasless approvals.",
    path: "/permit-signing",
  },
};

export default function Home() {
  const { openModal } = useModal();
  const { data: account } = useAccount();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Para + Ethers v6 Demo</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore signing different transaction types using Para with Ethers.js v6. Reference the{" "}
          <code className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
            /src/hooks/useParaSigner.ts
          </code>{" "}
          file to see how we create the{" "}
          <code className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-md">ParaEthersSigner</code>.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {Object.entries(transactionTypes).map(([id, transaction]) => (
          <Card
            key={id}
            title={transaction.title}
            description={transaction.description}>
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
