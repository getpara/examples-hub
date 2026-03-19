"use client";

import { useModal, useAccount, useAlchemySmartAccount } from "@getpara/react-sdk";
import { useMutation } from "@tanstack/react-query";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { SendTransaction } from "@/components/ui/SendTransaction";
import { ALCHEMY_API_KEY, GAS_POLICY_ID, CHAIN } from "@/lib/alchemy";

const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";

export default function Home() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();

  const { smartAccount, isLoading, error: clientError } = useAlchemySmartAccount({
    apiKey: ALCHEMY_API_KEY,
    chain: CHAIN,
    gasPolicyId: GAS_POLICY_ID,
  });
  const {
    mutateAsync: sendTx,
    isPending,
    data: txHash,
    error: txError,
  } = useMutation({
    mutationFn: async (params: { to: `0x${string}`; data?: `0x${string}`; value?: bigint }) => {
      const receipt = await smartAccount!.sendTransaction(params);
      return receipt.transactionHash;
    },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Alchemy Account Abstraction</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Send gas-sponsored transactions using Para wallet with Alchemy&apos;s EIP-4337 infrastructure. This example
          demonstrates modular smart accounts with paymaster gas sponsorship on Sepolia testnet.
        </p>
      </div>

      {!isConnected ? (
        <ConnectCard onConnect={openModal} />
      ) : (
        <div className="max-w-xl mx-auto">
          <WalletInfo
            smartAccountAddress={smartAccount?.smartAccountAddress ?? null}
            isLoading={isLoading}
            error={clientError}
          />
          <SendTransaction
            onSend={() => sendTx({ to: BURN_ADDRESS })}
            isPending={isPending}
            error={txError}
            txHash={txHash ?? null}
            isReady={!!smartAccount}
          />
        </div>
      )}
    </div>
  );
}
