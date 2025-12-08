"use client";

import ConnectWalletButton from "@/components/connect-wallet-button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useAccount } from "@getpara/react-sdk";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FullScreenLoader } from "@/components/full-screen-loader";
import { MAX_SMART_WALLETS_PER_EOA } from "@/config/smart-wallet";

export default function Home() {
  const { isConnected, isLoading } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isConnected) {
      router.replace("/accounts");
    }
  }, [isConnected, isLoading, router]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (isConnected) {
    return <FullScreenLoader />;
  }
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 z-0">
      <div className="container mx-auto max-w-2xl flex flex-col items-center text-center space-y-6 py-8 md:py-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm font-medium">
            Powered by Alchemy Account Kit
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-foreground">
          Smart Wallets with Alchemy Account Kit
        </h1>
        <p className="max-w-[600px] text-muted-foreground md:text-lg">
          Experience the power of ERC-4337 Account Abstraction with Alchemy&apos;s modular smart accounts. Create gasless, 
          programmable wallets on Sepolia testnet.
        </p>
        <div className="space-y-4 pt-4 w-full max-w-lg">
          <h2 className="text-2xl font-semibold tracking-tight">Alchemy Account Kit Features</h2>
          <ul className="grid gap-3 text-left text-sm md:text-base">
            <li className="flex items-start">
              <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>
                <strong>Modular Smart Accounts:</strong> ERC-6900 compliant accounts with plugin architecture for extensibility.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>
                <strong>Gas Sponsorship:</strong> Gasless transactions powered by Alchemy&apos;s Gas Manager API and paymasters.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>
                <strong>Bundler Infrastructure:</strong> Reliable UserOperation bundling with Alchemy&apos;s production-grade bundler.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>
                <strong>Multi-Wallet Support:</strong> Deploy up to {MAX_SMART_WALLETS_PER_EOA} smart accounts per EOA with deterministic addresses.
              </span>
            </li>
          </ul>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground max-w-lg">
          <p className="font-medium mb-1">🚀 Testnet Demo</p>
          <p>This demo runs on Sepolia testnet with sponsored gas. Connect your wallet to create and manage Alchemy-powered smart accounts.</p>
        </div>
        <div className="pt-6">
          <ConnectWalletButton
            label="Connect Wallet to Get Started"
            iconAfter={<ArrowRight className="h-5 w-5" />}
            size="lg"
            className="px-6 py-3 text-base md:text-lg"
            data-testid="home-connect-wallet-button"
          />
        </div>
      </div>
    </div>
  );
}
