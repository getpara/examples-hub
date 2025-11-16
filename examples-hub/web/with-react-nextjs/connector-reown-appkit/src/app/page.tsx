"use client";

import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { ConnectWalletCard } from "@/components/ui/ConnectWalletCard";
import { WalletDisplay } from "@/components/ui/WalletDisplay";
import { APP_NAME, APP_DESCRIPTION } from "@/config/appkit";

export default function Home() {
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">{APP_NAME}</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {APP_DESCRIPTION}
        </p>
      </div>

      {!isConnected ? (
        <ConnectWalletCard onConnect={() => open()} />
      ) : (
        <div className="max-w-xl mx-auto">
          <WalletDisplay />
          
          <button
            onClick={() => open()}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Open Account Modal
          </button>
        </div>
      )}
    </div>
  );
}