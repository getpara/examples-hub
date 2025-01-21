"use client";
import { useState } from "react";
import { ExternalWallet } from "@usecapsule/react-sdk";
import { CapsuleModal } from "@usecapsule/react-sdk";
import "@usecapsule/react-sdk/styles.css";
import { capsule } from "@/client/capsule";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Capsule + Cosmos Example</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Capsule Modal with Cosmos external wallets (Keplr, Leap)
        in a Next.js (App Router) project.
      </p>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
        Connect Wallet
      </button>

      <CapsuleModal
        capsule={capsule}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        externalWallets={[ExternalWallet.KEPLR, ExternalWallet.LEAP]}
        disableEmailLogin
        disablePhoneLogin
      />
    </main>
  );
}
