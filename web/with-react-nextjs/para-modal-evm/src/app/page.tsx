"use client";

import { useState } from "react";
import { useAccount, useModal, useWallet, useSignMessage } from "@getpara/react-sdk";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { ConnectWalletCard } from "@/components/ui/ConnectWalletCard";
import { SignMessageForm } from "@/components/ui/SignMessageForm";
import { SignatureDisplay } from "@/components/ui/SignatureDisplay";

export default function Home() {
  const [message, setMessage] = useState("Hello Para!");
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const signMessageHook = useSignMessage();

  const address = wallet?.address;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !wallet?.id) {
      return;
    }

    signMessageHook.signMessage({
      walletId: wallet.id,
      messageBase64: btoa(message),
    });
  };

  // Reset signature when message changes
  const handleMessageChange = (value: string) => {
    setMessage(value);
    if (signMessageHook.data) {
      signMessageHook.reset();
    }
  };

  // Derive status from signing state
  const status = {
    show: signMessageHook.isPending || !!signMessageHook.error || !!signMessageHook.data,
    type: signMessageHook.isPending
      ? ("info" as const)
      : signMessageHook.error
      ? ("error" as const)
      : ("success" as const),
    message: signMessageHook.isPending
      ? "Signing message..."
      : signMessageHook.error
      ? signMessageHook.error.message || "Failed to sign message. Please try again."
      : "Message signed successfully!",
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Para Modal + EVM Wallets Demo</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Sign messages with your Para wallet or EVM wallets. This example demonstrates integration with MetaMask,
          Coinbase, WalletConnect, Rainbow, Zerion, and Rabby wallets.
        </p>
      </div>

      {!isConnected ? (
        <ConnectWalletCard onConnect={openModal} />
      ) : (
        <div className="max-w-xl mx-auto">
          <div className="mb-8 rounded-none border border-gray-200">
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Connected Wallet</h3>
            </div>
            <div className="px-6 py-3">
              <p className="text-sm text-gray-500">Address</p>
              <p className="text-lg font-medium text-gray-900 font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          </div>

          <StatusAlert
            show={status.show}
            type={status.type}
            message={status.message}
          />

          <SignMessageForm
            message={message}
            isLoading={signMessageHook.isPending}
            onMessageChange={handleMessageChange}
            onSubmit={handleSubmit}
          />

          {signMessageHook.data && "signature" in signMessageHook.data && (
            <SignatureDisplay signature={signMessageHook.data.signature} />
          )}
        </div>
      )}
    </div>
  );
}
