"use client";

import { useModal, useAccount } from "@getpara/react-sdk";
import { useMeeClient } from "@/hooks/useMeeClient";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { useFusionTransfer } from "@/hooks/useFusionTransfer";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { TransferForm } from "@/components/ui/TransferForm";

export default function Home() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();

  const { meeClient, orchestrator, isLoading: isMeeLoading, error: meeError } = useMeeClient();
  const { balance } = useUsdcBalance();
  const { executeTransfers, isPending, status, meeScanLink, error: txError } = useFusionTransfer(
    meeClient,
    orchestrator
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Para + Biconomy MEE</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Send gas-abstracted USDC transfers using Para wallet with Biconomy&apos;s Multi-chain Execution Engine.
          Pay transaction fees in USDC instead of ETH with a single signature for batched transfers.
        </p>
      </div>

      {!isConnected ? (
        <ConnectCard onConnect={openModal} />
      ) : (
        <div className="max-w-xl mx-auto">
          <WalletInfo
            balance={balance}
            isMeeReady={!!meeClient}
            isMeeLoading={isMeeLoading}
            meeError={meeError}
          />
          <TransferForm
            onExecute={executeTransfers}
            isPending={isPending}
            status={status}
            meeScanLink={meeScanLink}
            error={txError}
            isReady={!!meeClient}
          />
        </div>
      )}
    </div>
  );
}

