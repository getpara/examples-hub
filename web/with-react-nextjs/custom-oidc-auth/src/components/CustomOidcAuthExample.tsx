"use client";

import { useEffect } from "react";
import { ParaProvider } from "@/components/ParaProvider";
import { Header } from "@/components/layout/Header";
import { OidcSignInCard } from "@/components/ui/OidcSignInCard";
import { RequestFaucet } from "@/components/ui/RequestFaucet";
import { SendTransaction } from "@/components/ui/SendTransaction";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { useFaucet } from "@/hooks/useFaucet";
import { useOidcAuth } from "@/hooks/useOidcAuth";
import { useParaSession } from "@/hooks/useParaSession";
import { useSendTransaction } from "@/hooks/useSendTransaction";

export function CustomOidcAuthExample() {
  return (
    <ParaProvider>
      <CustomOidcAuthRuntime />
    </ParaProvider>
  );
}

function CustomOidcAuthRuntime() {
  const auth = useOidcAuth();
  const session = useParaSession();
  const faucet = useFaucet();
  const tx = useSendTransaction();

  // Faucet/send-tx state outlives the connected view (the hooks sit above the connection
  // gate), so clear it on disconnect to keep a stale hash from reappearing on the next login.
  useEffect(() => {
    if (!session.isConnected) {
      faucet.reset();
      tx.reset();
    }
  }, [session.isConnected, faucet.reset, tx.reset]);

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
        {!session.isConnected ? (
          <OidcSignInCard
            isReady={auth.isReady}
            isPending={auth.isPending}
            status={auth.status}
            error={auth.error}
            onSignIn={auth.signIn}
          />
        ) : (
          <div className="w-full space-y-4">
            <WalletInfo address={session.address} />
            <RequestFaucet
              onRequest={faucet.request}
              isPending={faucet.isPending}
              txHash={faucet.txHash}
              error={faucet.error}
            />
            <SendTransaction
              amount={tx.amount}
              onSend={tx.send}
              isLoading={tx.isLoading}
              isReady={tx.isReady}
              txHash={tx.txHash}
              error={tx.error}
            />
          </div>
        )}
      </main>
    </div>
  );
}
