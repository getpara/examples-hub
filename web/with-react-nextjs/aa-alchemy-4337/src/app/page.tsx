"use client";

import { useModal, useAccount } from "@getpara/react-sdk";
import { useAlchemySmartAccount } from "@/hooks/useAlchemySmartAccount";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { SendTransaction } from "@/components/ui/SendTransaction";

export default function Home() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();

  const {
    smartAccountAddress,
    isInitializing,
    isReady,
    error: smartAccountError,
    sendSponsoredTransaction,
    isPending,
    txHash,
    txError,
  } = useAlchemySmartAccount();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Alchemy Account Abstraction</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Send gas-sponsored transactions using Para wallet with Alchemy&apos;s EIP-4337 infrastructure. This example
          demonstrates modular smart accounts with paymaster gas sponsorship on Sepolia testnet.
        </p>
      </div>

      {!isConnected ? (
        <ConnectCard onConnect={openModal} />
      ) : (
        <div className="max-w-xl mx-auto">
          <WalletInfo
            smartAccountAddress={smartAccountAddress}
            isInitializing={isInitializing}
            error={smartAccountError}
          />
          <SendTransaction
            onSend={sendSponsoredTransaction}
            isPending={isPending}
            error={txError}
            txHash={txHash}
            isReady={isReady}
          />
        </div>
      )}
    </div>
  );
}
