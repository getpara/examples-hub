import { useState } from "react";
import { useAccount, useSendTokens, useStargateSigningClient } from "graz";
import { ICS_PROVIDER_TESTNET } from "@/lib/chain";

const CHAIN_ID = ICS_PROVIDER_TESTNET.chainId;
const BALANCE_REFRESH_DELAY_MS = 2000;

interface UseGrazTokenTransferOptions {
  onSent: () => void;
}

function toMinimalDenomAmount(amount: string) {
  const parsedAmount = Number.parseFloat(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return null;
  }

  const minimalAmount = Math.floor(parsedAmount * 10 ** ICS_PROVIDER_TESTNET.decimals);
  return minimalAmount > 0 ? minimalAmount.toString() : null;
}

export function useGrazTokenTransfer({ onSent }: UseGrazTokenTransferOptions) {
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const { isConnected } = useAccount({ chainId: [CHAIN_ID] as const });
  const { sendTokensAsync } = useSendTokens();
  const { data: signingClients } = useStargateSigningClient({
    chainId: [CHAIN_ID] as const,
    enabled: isConnected,
  });
  const signingClient = signingClients?.[CHAIN_ID] ?? null;

  const send = async (amount: string) => {
    setIsSending(true);
    setErrorMessage(null);
    setTransactionHash(null);

    try {
      if (!signingClient) {
        throw new Error("Signing client is not ready yet.");
      }

      const amountInMinimalDenom = toMinimalDenomAmount(amount);

      if (!amountInMinimalDenom) {
        throw new Error("Enter an amount greater than zero.");
      }

      const response = await sendTokensAsync({
        signingClient,
        recipientAddress: ICS_PROVIDER_TESTNET.faucetAddress,
        amount: [{ denom: ICS_PROVIDER_TESTNET.denom, amount: amountInMinimalDenom }],
        fee: {
          amount: [{ denom: ICS_PROVIDER_TESTNET.denom, amount: "5000" }],
          gas: "200000",
        },
        memo: `Return ${amount} ${ICS_PROVIDER_TESTNET.currencySymbol} to faucet`,
      });

      setTransactionHash(response.transactionHash);
      window.setTimeout(onSent, BALANCE_REFRESH_DELAY_MS);
      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Transaction failed. Please try again.");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    send,
    transactionHash,
    errorMessage,
    isSending,
    isReady: Boolean(signingClient),
  };
}
