"use client";

import { useParams } from "next/navigation";
import { transactionTypes, TransactionID } from "@/example-transactions";
import { useAccount, useModal } from "@getpara/react-sdk";

export default function DemoPage() {
  const params = useParams();
  const type = params.type as TransactionID;
  const { openModal } = useModal();
  const { data: account } = useAccount();

  if (!account?.isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">
            Wallet Connection Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to view this demo.
          </p>
          <button
            onClick={openModal}
            className="inline-flex items-center justify-center rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-950 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const DemoComponent = transactionTypes[type]?.component;

  if (!DemoComponent) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Demo Type</h1>
          <p className="text-gray-600">
            The requested demo type does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <DemoComponent />
      </div>
    </div>
  );
}
