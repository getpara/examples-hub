"use client";

import { useState } from "react";
import { ExternalWallet } from "@usecapsule/react-sdk";
import { CapsuleModal } from "@usecapsule/react-sdk";
import { capsule } from "@/client/capsule";

import "@usecapsule/react-sdk/styles.css";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [_, setIsConnected] = useState(false);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = async () => {
    const isFullyLoggedIn = await capsule.isFullyLoggedIn();
    setIsConnected(isFullyLoggedIn);
    setIsOpen(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Capsule + Cosmos Example</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Capsule Modal with Solana Wallet Connectors in a Next.js
        (App Router) project.
      </p>
      <button
        onClick={handleOpenModal}
        className="rounded-md px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
        Open Capsule Modal
      </button>

      <CapsuleModal
        capsule={capsule}
        isOpen={isOpen}
        onClose={handleCloseModal}
        externalWallets={[ExternalWallet.PHANTOM, ExternalWallet.BACKPACK, ExternalWallet.GLOW]}
        disableEmailLogin
        disablePhoneLogin
        onRampTestMode
      />
    </main>
  );
}
