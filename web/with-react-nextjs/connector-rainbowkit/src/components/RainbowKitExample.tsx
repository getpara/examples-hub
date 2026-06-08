"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Header } from "@/components/layout/Header";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { SignMessage } from "@/components/ui/SignMessage";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { useSignHelloWorld } from "@/hooks/useSignHelloWorld";

interface RainbowKitActionProps {
  label: string;
  compact?: boolean;
}

function RainbowKitAction({ label, compact = false }: RainbowKitActionProps) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, mounted, openAccountModal, openChainModal, openConnectModal }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        const isWrongNetwork = chain?.unsupported;
        const buttonLabel = !connected
          ? label
          : isWrongNetwork
            ? "Wrong network"
            : account.displayName;

        const handleClick = () => {
          if (!connected) {
            openConnectModal();
            return;
          }

          if (isWrongNetwork) {
            openChainModal();
            return;
          }

          openAccountModal();
        };

        return (
          <button
            type="button"
            className={`btn-primary ${compact ? "px-4 py-2 text-sm" : "w-full px-4 py-3"}`}
            disabled={!ready}
            onClick={handleClick}>
            {buttonLabel}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function RainbowKitExample() {
  const { address, isConnected } = useAccount();
  const { sign, message, isPending, error, signature } = useSignHelloWorld();

  return (
    <main className="min-h-screen">
      <Header connectButton={<RainbowKitAction label="Connect Wallet" compact />} />

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            RainbowKit connector
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Connect with RainbowKit
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            Use Para as a RainbowKit wallet connector, then sign a message through Wagmi.
          </p>
        </div>

        <div className="animate-fade-in-up-delayed mx-auto w-full max-w-xl">
          {!isConnected ? (
            <ConnectCard connectButton={<RainbowKitAction label="Connect with RainbowKit" />} />
          ) : (
            <div className="space-y-4">
              <WalletInfo address={address} />
              <SignMessage
                message={message}
                onSign={sign}
                isPending={isPending}
                error={error}
                signature={signature}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
