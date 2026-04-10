"use client";

import { useAccount, useClient, useLogout } from "@getpara/react-sdk";
import { useE2ECleanup } from "@/lib/e2e-helpers";
import { useParaViemClient, useParaViemSignMessage } from "@getpara/react-sdk/evm";
import { http } from "viem";
import { sepolia } from "viem/chains";
import { PhoneAuth } from "@/components/ui/PhoneAuth";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { SignMessage } from "@/components/ui/SignMessage";

const HELLO_WORLD_MESSAGE = "Hello World!";

export default function Home() {
  const { isConnected } = useAccount();
  const para = useClient();
  const { logout } = useLogout();

  const { viemClient } = useParaViemClient({ walletClientConfig: { chain: sepolia, transport: http() } });
  const { signMessage, isPending, error, data: signature } = useParaViemSignMessage(viemClient);

  // E2E testing cleanup (internal only - safe to remove)
  useE2ECleanup(para);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Custom Phone Auth Demo</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Sign messages with your Para wallet using custom phone authentication. This demonstrates building your own
          auth UI with Para SDK hooks instead of using the built-in modal.
        </p>
      </div>

      {!isConnected ? (
        <PhoneAuth />
      ) : (
        <div className="max-w-xl mx-auto">
          <WalletInfo />
          <SignMessage
            message={HELLO_WORLD_MESSAGE}
            onSign={() => signMessage({ message: HELLO_WORLD_MESSAGE })}
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
