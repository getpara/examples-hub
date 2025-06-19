"use client";

import ConnectWalletButton from "@/components/connect-wallet-button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useAccount } from "@getpara/react-sdk";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FullScreenLoader } from "@/components/FullScreenLoader";
import { MAX_SMART_WALLETS_PER_EOA } from "@/constants/smart-wallet";

export default function Home() {
  const { data: account, isLoading } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && account?.isConnected) {
      router.replace("/accounts");
    }
  }, [account?.isConnected, isLoading, router]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (account?.isConnected) {
    return <FullScreenLoader />;
  }
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 z-0">
      <div className="container mx-auto max-w-2xl flex flex-col items-center text-center space-y-6 py-8 md:py-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-foreground">
          The Future of Wallets is Smart
        </h1>
        <p className="max-w-[600px] text-muted-foreground md:text-lg">
          Step into the next generation of crypto with Account Abstraction. Create your own smart contract wallet,
          controlled by you.
        </p>
        <div className="space-y-4 pt-4 w-full max-w-lg">
          <h2 className="text-2xl font-semibold tracking-tight">Unlock Smart Wallet Powers</h2>
          <ul className="grid gap-3 text-left text-sm md:text-base">
            <li className="flex items-start">
              <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>
                <strong>Programmable Control:</strong> Set spending limits, automate transactions, social recovery.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>
                <strong>Enhanced Security:</strong> Multi-factor options, fraud detection, no seed phrases.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>
                <strong>Simplified Experience:</strong> Gasless transactions, pay fees in various tokens.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>
                <strong>Multiple Wallets:</strong> Create up to {MAX_SMART_WALLETS_PER_EOA} smart wallets per EOA for better organization.
              </span>
            </li>
          </ul>
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
