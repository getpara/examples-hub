"use client";

import { useAccount, useModal, useWallet } from "@getpara/react-sdk";
import { ParaProvider } from "@/components/ParaProvider";
import { Header } from "@/components/layout/Header";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { RecoveryFlow } from "@/components/ui/RecoveryFlow";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { useSafeRecoveryDemo } from "@/hooks/useSafeRecoveryDemo";

export function SafeRecoveryExample() {
  return (
    <ParaProvider>
      <SafeRecoveryExampleContent />
    </ParaProvider>
  );
}

function SafeRecoveryExampleContent() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const address = wallet?.address ?? "";
  const recoveryDemo = useSafeRecoveryDemo({
    enabled: isConnected,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header isConnected={isConnected} address={address} onConnect={openModal} />

      <main
        className={
          isConnected
            ? "mx-auto w-full max-w-3xl px-4 py-10"
            : "flex-1 flex items-center justify-center px-4 pb-16"
        }>
        {!isConnected ? (
          <ConnectCard onConnect={openModal} />
        ) : (
          <div className="w-full space-y-4">
            <WalletInfo
              walletAddress={address}
              smartAccountAddress={recoveryDemo.safeAddress}
              ownerAddress={recoveryDemo.ownerAddress}
              isLoading={recoveryDemo.isWorking || recoveryDemo.isGuardianAccountLoading}
            />
            <RecoveryFlow demo={recoveryDemo} />
          </div>
        )}
      </main>
    </div>
  );
}
