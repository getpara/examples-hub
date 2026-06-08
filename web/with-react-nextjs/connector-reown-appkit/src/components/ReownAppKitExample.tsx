"use client";

import { Header } from "@/components/layout/Header";
import { ConnectWalletCard } from "@/components/ui/ConnectWalletCard";
import { WalletDisplay } from "@/components/ui/WalletDisplay";
import { APP_DESCRIPTION } from "@/config/appkit";
import { useReownAppKitWallet } from "@/hooks/useReownAppKitWallet";

export function ReownAppKitExample() {
  const wallet = useReownAppKitWallet();

  return (
    <main className="min-h-screen">
      <Header
        address={wallet.address}
        isConnected={wallet.isConnected}
        onConnect={wallet.openAppKit}
      />

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Reown AppKit connector
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Connect with Reown AppKit
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            {APP_DESCRIPTION}
          </p>
        </div>

        <div className="animate-fade-in-up-delayed mx-auto w-full max-w-xl">
          {!wallet.isConnected ? (
            <ConnectWalletCard onConnect={wallet.openAppKit} />
          ) : (
            <WalletDisplay
              address={wallet.address}
              balance={wallet.balance}
              networkName={wallet.networkName}
              onDisconnect={wallet.disconnectWallet}
              onOpenAccount={wallet.openAppKit}
            />
          )}
        </div>
      </section>
    </main>
  );
}
