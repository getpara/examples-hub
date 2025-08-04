"use client";

import { Button } from "@/components/ui/button";
import { useModal, useWallet, useAccount } from "@getpara/react-sdk";
import { Wallet, UserCircle, CheckCircle, LogIn } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { openModal } = useModal();
  const { data: wallet } = useWallet();
  const { isConnected, isLoading } = useAccount();

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center justify-between border-b bg-background sticky top-0 z-50">
      <Link
        href="/"
        className="flex items-center justify-center">
        <Wallet className="h-6 w-6 text-primary" />
        <span className="ml-2 font-semibold text-lg">SmartWallet</span>
      </Link>
      <nav className="flex items-center gap-4">
        {/* Optionally, add other navigation links here if needed */}
        {/* Example: <Link href="/dashboard" className="text-sm font-medium hover:underline">Dashboard</Link> */}

        {!isLoading && isConnected && wallet?.address ? (
          <Button
            variant="outline"
            onClick={() => openModal()}
            className="flex items-center"
            data-testid="navbar-connected-address-button">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            <span className="font-mono text-xs sm:text-sm">
              {wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}
            </span>
            <UserCircle className="h-4 w-4 ml-2 hidden sm:block" />
          </Button>
        ) : !isLoading ? (
          <Button onClick={() => openModal()} data-testid="navbar-connect-wallet-button">
            <LogIn className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        ) : null}
      </nav>
    </header>
  );
}
