"use client";

import { useEffect } from "react";
import { ParaProvider } from "@/components/ParaProvider";
import { Header } from "@/components/layout/Header";
import { MfaChallengeCard } from "@/components/ui/MfaChallengeCard";
import { OidcSignInCard } from "@/components/ui/OidcSignInCard";
import { RequestFaucet } from "@/components/ui/RequestFaucet";
import { SendTransaction } from "@/components/ui/SendTransaction";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { useFaucet } from "@/hooks/useFaucet";
import { useMfaChallenge } from "@/hooks/useMfaChallenge";
import { useOidcAuth } from "@/hooks/useOidcAuth";
import { useParaSession } from "@/hooks/useParaSession";
import { SEND_MIN_BALANCE_WEI, useSendTransaction } from "@/hooks/useSendTransaction";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { SEPOLIA_FAUCET_RETURN_ADDRESS } from "@/lib/para";

export function CustomOidcAuthExample() {
  return (
    <ParaProvider>
      <CustomOidcAuthRuntime />
    </ParaProvider>
  );
}

function CustomOidcAuthRuntime() {
  const auth = useOidcAuth();
  const mfa = useMfaChallenge();
  const session = useParaSession();
  const faucet = useFaucet();
  const tx = useSendTransaction(SEPOLIA_FAUCET_RETURN_ADDRESS);
  const balance = useWalletBalance(session.address);
  const refreshBalance = balance.refresh;
  const hasEnoughBalanceForSend = balance.balanceWei !== null && balance.balanceWei >= SEND_MIN_BALANCE_WEI;
  const sendDisabledReason = balance.isLoading
    ? "Checking Sepolia balance..."
    : !tx.isReady
      ? "Preparing your Para wallet signer..."
      : !hasEnoughBalanceForSend
        ? "Request enough Sepolia testnet ETH before sending."
        : null;
  const faucetDisabledReason = balance.isLoading
    ? "Checking Sepolia balance..."
    : balance.hasBalance
      ? "Wallet already has Sepolia ETH."
      : null;

  // Faucet/send-tx state outlives the connected view (the hooks sit above the connection
  // gate), so clear it on disconnect to keep a stale hash from reappearing on the next login.
  useEffect(() => {
    if (!session.isConnected) {
      faucet.reset();
      tx.reset();
    }
  }, [session.isConnected, faucet.reset, tx.reset]);

  useEffect(() => {
    if (faucet.status === "confirmed" || tx.status === "confirmed") {
      void refreshBalance();
    }
  }, [faucet.status, refreshBalance, tx.status]);

  return (
    <div className="flex min-h-screen flex-col" data-testid="custom-oidc-example">
      <Header
        isConnected={session.isConnected}
        address={session.address}
        onDisconnect={() => session.disconnect()}
        isDisconnecting={session.isDisconnecting}
      />

      <main
        className={
          session.isConnected
            ? "mx-auto w-full max-w-3xl px-4 py-10"
            : "flex flex-1 items-center justify-center px-4 pb-16"
        }>
        {/* A login can pause on a 2FA challenge (ENG-6906): once the SDK reports an MFA
            mode, swap the sign-in card for the enroll/verify card until it resolves. */}
        {!session.isConnected && mfa.mode ? (
          <MfaChallengeCard
            mode={mfa.mode}
            enrollment={mfa.enrollment}
            isEnrolling={mfa.isEnrolling}
            isVerifying={mfa.isVerifying}
            attemptsRemaining={mfa.attemptsRemaining}
            error={mfa.error}
            onVerify={mfa.verify}
          />
        ) : !session.isConnected ? (
          <OidcSignInCard
            isReady={auth.isReady}
            isPending={auth.isPending}
            status={auth.status}
            error={auth.error}
            onSignIn={auth.signIn}
          />
        ) : (
          <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm animate-fade-in-up">
            <WalletInfo
              address={session.address}
              balance={balance.formattedBalance}
              isBalanceLoading={balance.isLoading}
              balanceError={balance.error}
            />
            <RequestFaucet
              onRequest={faucet.request}
              isPending={faucet.isPending}
              disabledReason={faucetDisabledReason}
              txHash={faucet.txHash}
              status={faucet.status}
              error={faucet.error}
            />
            <SendTransaction
              amount={tx.amount}
              onSend={tx.send}
              isLoading={tx.isLoading}
              disabledReason={sendDisabledReason}
              txHash={tx.txHash}
              status={tx.status}
              recipientAddress={tx.recipientAddress}
              error={tx.error}
            />
          </div>
        )}
      </main>
    </div>
  );
}
