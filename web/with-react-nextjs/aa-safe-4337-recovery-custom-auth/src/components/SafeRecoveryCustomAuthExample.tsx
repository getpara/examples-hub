"use client";

import { Header } from "@/components/layout/Header";
import { AuthCard } from "@/components/ui/AuthCard";
import { RecoveryFlow } from "@/components/ui/RecoveryFlow";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { useCustomParaAuth } from "@/hooks/useCustomParaAuth";
import { useSafeRecoveryDemo } from "@/hooks/useSafeRecoveryDemo";

export function SafeRecoveryCustomAuthExample() {
  const auth = useCustomParaAuth();
  const recoveryDemo = useSafeRecoveryDemo({
    para: auth.para,
    guardianWalletAddress: auth.walletAddress,
    guardianWalletId: auth.walletId,
    enabled: auth.isConnected,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        isConnected={auth.isConnected}
        address={auth.walletAddress ?? ""}
        onDisconnect={auth.disconnect}
        isDisconnecting={auth.isDisconnecting}
      />

      <main
        className={
          auth.isConnected
            ? "mx-auto w-full max-w-3xl px-4 py-10"
            : "flex-1 flex items-center justify-center px-4 pb-16"
        }>
        {!auth.isConnected ? (
          <AuthCard
            email={auth.email}
            error={auth.error}
            isPending={auth.isPending}
            isPasskeyWindowOpen={auth.isPasskeyWindowOpen}
            isReady={auth.isReady}
            needsVerificationCode={auth.needsVerificationCode}
            onCancel={auth.cancel}
            onEmailChange={auth.setEmail}
            onOpenPasskey={auth.openPasskeyWindow}
            onSubmit={auth.submit}
            onSubmitVerificationCode={auth.submitVerificationCode}
            onVerificationCodeChange={auth.setVerificationCode}
            passkeyUrl={auth.passkeyUrl}
            verificationCode={auth.verificationCode}
            verifyUrl={auth.verifyUrl}
          />
        ) : (
          <div className="w-full space-y-4">
            <WalletInfo
              walletAddress={auth.walletAddress ?? ""}
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
