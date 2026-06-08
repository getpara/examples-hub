"use client";

import { useCallback, useEffect } from "react";
import type { TOAuthMethod } from "@getpara/react-sdk";
import { COUNTRY_CODES, OAUTH_PROVIDERS } from "@/constants/auth";
import { useCombinedAuth } from "@/hooks/useCombinedAuth";
import { useParaSession } from "@/hooks/useParaSession";
import { useSignHelloWorld } from "@/hooks/useSignHelloWorld";
import { ParaProvider } from "@/components/ParaProvider";
import { Header } from "@/components/layout/Header";
import { CombinedAuth } from "@/components/ui/CombinedAuth";
import { SignMessage } from "@/components/ui/SignMessage";
import { WalletInfo } from "@/components/ui/WalletInfo";

export function CustomCombinedAuthExample() {
  useEffect(() => {
    document.documentElement.dataset.customAuthHydrated = "true";

    return () => {
      delete document.documentElement.dataset.customAuthHydrated;
    };
  }, []);

  return (
    <div className="hydrated-app">
      <CustomCombinedAuthContent />
    </div>
  );
}

function CustomCombinedAuthContent() {
  return (
    <ParaProvider>
      <CustomCombinedAuthRuntime />
    </ParaProvider>
  );
}

function CustomCombinedAuthRuntime() {
  const auth = useCombinedAuth();
  const session = useParaSession();
  const signing = useSignHelloWorld();
  const oauthActiveProvider = auth.oauth.activeProvider;
  const oauthAuthenticate = auth.oauth.authenticate;
  const oauthCancel = auth.oauth.cancel;
  const oauthIsPending = auth.oauth.isPending;
  const authenticateOAuth = useCallback(
    (method: string) => oauthAuthenticate(method as TOAuthMethod),
    [oauthAuthenticate]
  );

  return (
    <main className="min-h-screen bg-background">
      <Header address={session.address} isConnected={session.isConnected} />

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1fr)] lg:px-8 lg:py-16">
        <div className="animate-fade-in-up">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">Custom auth</p>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Email, phone, and OAuth in one Para flow
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Build your own sign-in surface with Para hooks, then sign an EVM message once the wallet is connected.
          </p>
        </div>

        <div className="animate-fade-in-up space-y-4">
          {!session.isConnected ? (
            <CombinedAuth
              activeTab={auth.activeTab}
              countryCodes={COUNTRY_CODES}
              email={auth.email}
              error={auth.error}
              isPending={auth.isPending}
              oauth={{
                activeProvider: oauthActiveProvider,
                authenticate: authenticateOAuth,
                cancel: oauthCancel,
                isPending: oauthIsPending,
              }}
              onCancel={auth.cancel}
              onTabChange={auth.setActiveTab}
              phone={auth.phone}
              providers={OAUTH_PROVIDERS}
              step={auth.step}
              verifyUrl={auth.verifyUrl}
            />
          ) : (
            <>
              <WalletInfo address={session.address} />
              <SignMessage
                errorMessage={signing.errorMessage}
                isPending={signing.isPending}
                message={signing.message}
                onSign={signing.signMessage}
                signature={signing.signature}
              />
              <button
                type="button"
                onClick={() => session.disconnect()}
                disabled={session.isDisconnecting}
                className="btn-secondary min-h-11 w-full px-4 text-sm">
                {session.isDisconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
