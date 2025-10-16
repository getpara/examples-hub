"use client";

import { useEffect } from "react";
import { useAccount, useModal, useWallet, useSignMessage, useClient } from "@getpara/react-sdk";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { ConnectWalletCard } from "@/components/ui/ConnectWalletCard";
import { SignatureDisplay } from "@/components/ui/SignatureDisplay";
import { PageHeader } from "@/components/PageHeader";
import { ConnectedWallet } from "@/components/ConnectedWallet";

const HELLO_WORLD_MESSAGE = "Hello World!";

export default function Home() {
  const para = useClient();

  // Expose cleanup function and para client for E2E tests (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && para) {
      // Expose para client for test verification
      (window as any).para = para;

      // Expose cleanup function
      (window as any).__deleteTestUser = async () => {
        if (para?.userId) {
          try {
            await para.ctx.client.deleteSelf(para.userId);
            console.log('[E2E Cleanup] Test user deleted:', para.userId);
          } catch (error: any) {
            console.error('[E2E Cleanup] Failed to delete test user:', error.message);
            throw error;
          }
        }
      };
    }

    return () => {
      if (process.env.NODE_ENV === 'development') {
        delete (window as any).__deleteTestUser;
        delete (window as any).para;
      }
    };
  }, [para]);
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const signMessage = useSignMessage();

  const address = wallet?.address;

  const handleSignHelloWorld = () => {
    if (!isConnected || !wallet?.id) {
      return;
    }

    signMessage.signMessage({
      walletId: wallet.id,
      messageBase64: btoa(HELLO_WORLD_MESSAGE),
    });
  };

  const alertStatus = {
    show: signMessage.isPending || !!signMessage.error || !!signMessage.data,
    type: signMessage.isPending ? ("info" as const) : signMessage.error ? ("error" as const) : ("success" as const),
    message: signMessage.isPending
      ? "Signing 'Hello World!'..."
      : signMessage.error
      ? signMessage.error.message || "Failed to sign 'Hello World!'. Please try again."
      : "'Hello World!' signed successfully!",
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <PageHeader />
      {!isConnected ? (
        <ConnectWalletCard onConnect={openModal} />
      ) : (
        <div className="max-w-xl mx-auto">
          <ConnectedWallet address={address} />

          <StatusAlert
            show={alertStatus.show}
            type={alertStatus.type}
            message={alertStatus.message}
          />

          <div className="bg-white rounded-none border border-gray-200 p-6 mb-4">
            <h3 className="text-lg font-medium mb-4">Sign Message</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-none">
                <p className="text-sm text-gray-600 mb-1">Message to sign:</p>
                <p className="text-lg font-mono font-semibold">{HELLO_WORLD_MESSAGE}</p>
              </div>
              <button
                onClick={handleSignHelloWorld}
                disabled={signMessage.isPending}
                className="w-full px-4 py-2 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
                {signMessage.isPending ? "Signing..." : "Sign Hello World!"}
              </button>
            </div>
          </div>

          {signMessage.data && "signature" in signMessage.data && (
            <SignatureDisplay signature={signMessage.data.signature} />
          )}
        </div>
      )}
    </div>
  );
}
