"use client";

import { WalletConnectionGuard } from "@/components/wallet-connection-guard";
import { BulkWalletGenerator } from "@/components/bulk-wallet-generator";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <WalletConnectionGuard>
        <BulkWalletGenerator />
      </WalletConnectionGuard>
    </div>
  );
}
