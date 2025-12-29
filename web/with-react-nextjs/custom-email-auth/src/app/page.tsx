"use client";

import { useAccount, useClient, useLogout } from "@getpara/react-sdk";
import { useE2ECleanup } from "@/lib/e2e-helpers";
import { useSignHelloWorld } from "@/hooks/useSignHelloWorld";
import { EmailAuth } from "@/components/ui/EmailAuth";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { SignMessage } from "@/components/ui/SignMessage";

export default function Home() {
  const { isConnected } = useAccount();
  const para = useClient();
  const { logout } = useLogout();

  const { sign, message, isPending, error, signature } = useSignHelloWorld();

  // E2E testing cleanup (internal only - safe to remove)
  useE2ECleanup(para);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Custom Email Auth Demo</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Sign messages with your Para wallet using custom email authentication. This demonstrates building your own
          auth UI with Para SDK hooks instead of using the built-in modal.
        </p>
      </div>

      {!isConnected ? (
        <EmailAuth />
      ) : (
        <div className="max-w-xl mx-auto">
          <WalletInfo />
          <SignMessage
            message={message}
            onSign={sign}
            isPending={isPending}
            error={error}
            signature={signature}
          />
          <button
            onClick={() => logout()}
            className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-none hover:bg-gray-50 transition-colors font-medium">
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
