import { useCallback, useMemo, useState } from "react";
import {
  useAccount,
  useActiveChains,
  useBalance,
  useSendTokens,
  useStargateSigningClient,
} from "graz";
import { CHAIN_ID, FAUCET_ADDRESS } from "@/config/constants";
import { formatBalance } from "@/utils/format";

const FAUCET_URL = "https://testnet.ping.pub/cosmos/faucet";

function toError(error: unknown) {
  return error instanceof Error ? error : new Error("Transaction failed. Please try again.");
}

function toMinimalDenomAmount(amount: string, decimals: number) {
  const parsedAmount = Number.parseFloat(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return null;
  }

  const minimalAmount = Math.floor(parsedAmount * 10 ** decimals);
  return minimalAmount > 0 ? minimalAmount.toString() : null;
}

export function useGrazTokenTransfer() {
  const [amount, setAmount] = useState("");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isSending, setIsSending] = useState(false);

  const { data: accounts, isConnected } = useAccount({ chainId: [CHAIN_ID] as const });
  const address = accounts?.[CHAIN_ID]?.bech32Address ?? "";
  const activeChains = useActiveChains();
  const activeChain = activeChains?.find((chain) => chain.chainId === CHAIN_ID) ?? activeChains?.[0];

  const currency = activeChain?.currencies?.[0];
  const chainDenom = currency?.coinMinimalDenom ?? "uatom";
  const chainDecimals = currency?.coinDecimals ?? 6;
  const displayDenom = currency?.coinDenom ?? "ATOM";
  const networkName = activeChain?.chainName ?? "Cosmos ICS Provider Testnet";

  const {
    data: balance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useBalance({
    chainId: CHAIN_ID,
    denom: chainDenom,
    bech32Address: address,
    enabled: isConnected && Boolean(address),
  });

  const { sendTokensAsync } = useSendTokens();
  const { data: signingClients } = useStargateSigningClient({
    chainId: [CHAIN_ID] as const,
    enabled: isConnected,
  });
  const signingClient = signingClients?.[CHAIN_ID] ?? null;

  const balanceLabel = useMemo(() => {
    if (isBalanceLoading) {
      return "Loading...";
    }

    if (!balance) {
      return `0.0000 ${displayDenom}`;
    }

    const displayAmount = Number.parseFloat(balance.amount) / 10 ** chainDecimals;
    return `${formatBalance(displayAmount.toString())} ${displayDenom}`;
  }, [balance, chainDecimals, displayDenom, isBalanceLoading]);

  const refreshBalance = useCallback(() => {
    void refetchBalance();
  }, [refetchBalance]);

  const sendTokensToFaucet = useCallback(async () => {
    if (!signingClient) {
      setError(new Error("Signing client is not ready yet."));
      return;
    }

    const amountInMinimalDenom = toMinimalDenomAmount(amount, chainDecimals);
    if (!amountInMinimalDenom) {
      setError(new Error("Enter an amount greater than zero."));
      return;
    }

    setIsSending(true);
    setError(null);
    setTransactionHash(null);

    try {
      const response = await sendTokensAsync({
        signingClient,
        recipientAddress: FAUCET_ADDRESS,
        amount: [{ denom: chainDenom, amount: amountInMinimalDenom }],
        fee: {
          amount: [{ denom: chainDenom, amount: "5000" }],
          gas: "200000",
        },
        memo: `Return ${amount} ${displayDenom} to faucet`,
      });

      setTransactionHash(response.transactionHash);
      setAmount("");
      window.setTimeout(() => {
        void refetchBalance();
      }, 2000);
    } catch (transactionError) {
      setError(toError(transactionError));
    } finally {
      setIsSending(false);
    }
  }, [
    amount,
    chainDecimals,
    chainDenom,
    displayDenom,
    refetchBalance,
    sendTokensAsync,
    signingClient,
  ]);

  return {
    address,
    amount,
    displayDenom,
    networkName,
    balanceLabel,
    hasBalance: Boolean(balance),
    faucetAddress: FAUCET_ADDRESS,
    faucetUrl: FAUCET_URL,
    transactionHash,
    error,
    isBalanceLoading,
    isSending,
    canSend: Boolean(signingClient) && !isSending,
    setAmount,
    refreshBalance,
    sendTokensToFaucet,
  };
}
