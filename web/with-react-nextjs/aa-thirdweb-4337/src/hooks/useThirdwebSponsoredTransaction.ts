import { useCallback, useEffect, useMemo, useState } from "react";
import { useParaViemAccount } from "@getpara/react-sdk/evm";
import { prepareTransaction, sendTransaction } from "thirdweb";
import { viemAdapter } from "thirdweb/adapters/viem";
import { smartWallet, type Account } from "thirdweb/wallets";
import { createWalletClient, http, type Hash } from "viem";
import { thirdwebClient, THIRDWEB_CHAIN, VIEM_CHAIN } from "@/lib/thirdweb";

const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;
const THIRDWEB_CLIENT_ID_ERROR =
  "NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not configured. Add it to your environment to use Thirdweb features.";
type ThirdwebWalletClient = Parameters<typeof viemAdapter.walletClient.fromViem>[0]["walletClient"];

interface UseThirdwebSponsoredTransactionOptions {
  enabled?: boolean;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error("Thirdweb transaction failed. Please try again.");
}

export function useThirdwebSponsoredTransaction({
  enabled = true,
}: UseThirdwebSponsoredTransactionOptions = {}) {
  const [smartAccount, setSmartAccount] = useState<Account | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<Error | null>(null);
  const [transactionHash, setTransactionHash] = useState<Hash | null>(null);
  const [transactionError, setTransactionError] = useState<Error | null>(null);
  const [isConnectingSmartAccount, setIsConnectingSmartAccount] = useState(false);
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);

  const {
    viemAccount,
    isLoading: isViemAccountLoading,
    error: viemAccountError,
  } = useParaViemAccount();

  const wallet = useMemo(
    () =>
      smartWallet({
        chain: THIRDWEB_CHAIN,
        sponsorGas: true,
      }),
    [],
  );

  useEffect(() => {
    let isCurrent = true;

    if (!enabled || !viemAccount) {
      setSmartAccount(null);
      setSmartAccountAddress(null);
      setAccountError(null);
      setIsConnectingSmartAccount(false);
      return () => {
        isCurrent = false;
      };
    }

    const client = thirdwebClient;

    if (!client) {
      setSmartAccount(null);
      setSmartAccountAddress(null);
      setAccountError(new Error(THIRDWEB_CLIENT_ID_ERROR));
      setIsConnectingSmartAccount(false);
      return () => {
        isCurrent = false;
      };
    }

    const connectSmartAccount = async () => {
      setIsConnectingSmartAccount(true);
      setAccountError(null);

      try {
        const walletClient = createWalletClient({
          account: viemAccount,
          chain: VIEM_CHAIN,
          transport: http(),
        });
        const personalAccount = viemAdapter.walletClient.fromViem({
          walletClient: walletClient as unknown as ThirdwebWalletClient,
        });
        const account = await wallet.connect({
          client,
          personalAccount,
        });

        if (!isCurrent) {
          return;
        }

        setSmartAccount(account);
        setSmartAccountAddress(account.address);
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setSmartAccount(null);
        setSmartAccountAddress(null);
        setAccountError(toError(error));
      } finally {
        if (isCurrent) {
          setIsConnectingSmartAccount(false);
        }
      }
    };

    void connectSmartAccount();

    return () => {
      isCurrent = false;
    };
  }, [enabled, viemAccount, wallet]);

  const sendSponsoredTransaction = useCallback(async () => {
    const client = thirdwebClient;

    if (!client) {
      setTransactionError(new Error(THIRDWEB_CLIENT_ID_ERROR));
      return;
    }

    if (!smartAccount) {
      setTransactionError(new Error("Thirdweb smart account is not ready yet."));
      return;
    }

    setIsSendingTransaction(true);
    setTransactionError(null);
    setTransactionHash(null);

    try {
      const transaction = prepareTransaction({
        client,
        chain: THIRDWEB_CHAIN,
        to: BURN_ADDRESS,
        value: BigInt(0),
      });
      const receipt = await sendTransaction({
        account: smartAccount,
        transaction,
      });
      setTransactionHash(receipt.transactionHash as Hash);
    } catch (error) {
      setTransactionError(toError(error));
    } finally {
      setIsSendingTransaction(false);
    }
  }, [smartAccount]);

  const isAccountLoading = enabled && (isViemAccountLoading || isConnectingSmartAccount);

  return {
    smartAccountAddress,
    targetAddress: BURN_ADDRESS,
    transactionHash,
    accountError: accountError ?? viemAccountError ?? null,
    transactionError,
    isAccountLoading,
    isSendingTransaction,
    canSendTransaction:
      enabled && Boolean(thirdwebClient) && Boolean(smartAccount) && !isAccountLoading && !isSendingTransaction,
    sendSponsoredTransaction,
  };
}
