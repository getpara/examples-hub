"use client";

import { useModal, useAccount } from "@getpara/react-sdk";
import { useSmartAccountClient } from "@/hooks/useSmartAccountClient";
import { useSendUserOperation } from "@/hooks/useSendUserOperation";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { SendTransaction } from "@/components/ui/SendTransaction";

const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";

export default function Home() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();

  const { client, address, isLoading, error: clientError } = useSmartAccountClient();
  const { sendUserOperation, isPending, txHash, error: txError } = useSendUserOperation(client);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">ZeroDev EIP-7702</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Send gas-sponsored transactions using Para wallet with ZeroDev&apos;s EIP-7702 infrastructure. This example
          demonstrates 7702 smart EOA with paymaster gas sponsorship on Sepolia testnet.
        </p>
      </div>

      {!isConnected ? (
        <ConnectCard onConnect={openModal} />
      ) : (
        <div className="max-w-xl mx-auto">
          <WalletInfo
            smartAccountAddress={address}
            isLoading={isLoading}
            error={clientError}
          />
          <SendTransaction
            onSend={() => sendUserOperation({ target: BURN_ADDRESS })}
            isPending={isPending}
            error={txError}
            txHash={txHash}
            isReady={!!client}
          />
        </div>
      )}
    </div>
  );
}
