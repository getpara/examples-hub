"use client";

import { useEffect } from "react";
import { ParaProvider } from "@/components/ParaProvider";
import { Header } from "@/components/layout/Header";
import { PhoneAuth } from "@/components/ui/PhoneAuth";
import { SignMessage } from "@/components/ui/SignMessage";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { COUNTRY_CODES } from "@/constants/auth";
import { useParaSession } from "@/hooks/useParaSession";
import { usePhoneAuth } from "@/hooks/usePhoneAuth";
import { useSignHelloWorld } from "@/hooks/useSignHelloWorld";

export function CustomPhoneAuthExample() {
  useEffect(() => {
    document.documentElement.dataset.customPhoneAuthHydrated = "true";

    return () => {
      delete document.documentElement.dataset.customPhoneAuthHydrated;
    };
  }, []);

  return (
    <div className="hydrated-app">
      <ParaProvider>
        <CustomPhoneAuthRuntime />
      </ParaProvider>
    </div>
  );
}

function CustomPhoneAuthRuntime() {
  const auth = usePhoneAuth();
  const session = useParaSession();
  const signing = useSignHelloWorld();

  return (
    <main className="min-h-screen bg-background">
      <Header address={session.address} isConnected={session.isConnected} />

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1fr)] lg:px-8 lg:py-16">
        <div className="animate-fade-in-up">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">Custom phone auth</p>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            SMS login with your own Para UI
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Start a phone auth flow with Para hooks, then sign an EVM message once the wallet is connected.
          </p>
        </div>

        <div className="animate-fade-in-up space-y-4">
          {!session.isConnected ? (
            <PhoneAuth
              countryCode={auth.countryCode}
              countryCodes={COUNTRY_CODES}
              error={auth.error}
              isPending={auth.isPending}
              onCancel={auth.cancel}
              onCountryCodeChange={auth.setCountryCode}
              onPhoneNumberChange={auth.setPhoneNumber}
              onSubmit={auth.submit}
              phoneNumber={auth.phoneNumber}
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
