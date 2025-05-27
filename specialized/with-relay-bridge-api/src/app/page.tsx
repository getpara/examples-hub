"use client";

import { useState, useCallback } from "react";
import { AuthLayout, OAuthMethod, ParaModal, useAccount, useModal } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";
import { SupportedNetwork, NETWORK_CONFIG, ASSET_DETAILS } from "@/constants";
import { useRelayBridge } from "@/hooks/useRelayBridge";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { TransactionProcessing } from "@/components/TransactionProcessing";
import { BridgeForm } from "@/components/BridgeForm";
import { AssetDisplay } from "@/components/AssetDisplay";
import { NetworkSelector } from "@/components/NetworkSelector";
import { AmountInput } from "@/components/AmountInput";
import { ReceiveAmount } from "@/components/ReceiveAmount";
import { TransactionDetails } from "@/components/TransactionDetails";
import type { ProgressData } from "@reservoir0x/relay-sdk";
import { useSigners } from "@/hooks/useSigners";

type TransactionState = "idle" | "sending" | "checking" | "complete" | "failed";
type StepType = "approve" | "deposit" | "fill" | "complete" | "failed";

export default function Home() {
  const { openModal } = useModal();
  const { data: account } = useAccount();
  const { useQuote, executeBridge, isExecuting } = useRelayBridge();
  const { ethereumViem, baseViem, solanaSvm } = useSigners();

  const [originNetwork, setOriginNetwork] = useState<SupportedNetwork | null>(null);
  const [destNetwork, setDestNetwork] = useState<SupportedNetwork | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [transactionState, setTransactionState] = useState<TransactionState>("idle");
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<StepType>("deposit");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const getNetworkAddress = useCallback(
    (networkId: SupportedNetwork | null): string | null => {
      if (!networkId) return null;

      switch (networkId) {
        case "ethereum":
          return ethereumViem.address;
        case "base":
          return baseViem.address;
        case "solana":
          return solanaSvm.address;
        default:
          return null;
      }
    },
    [ethereumViem.address, baseViem.address, solanaSvm.address]
  );

  const originAddress = getNetworkAddress(originNetwork);
  const destAddress = getNetworkAddress(destNetwork);

  const { balance: originBalance } = useTokenBalance({ network: originNetwork });
  const { balance: destBalance } = useTokenBalance({ network: destNetwork });

  const parsedAmount = parseFloat(amount) || 0;
  const parsedBalance = parseFloat(originBalance) || 0;

  const quoteQuery = useQuote({
    originNetwork,
    destNetwork,
    amount,
    originAddress,
    destAddress,
  });

  const { data: quote, isLoading: isQuoting, error: quoteError } = quoteQuery;

  const destAmount =
    quote?.details?.currencyOut?.amountFormatted || (parsedAmount > 0 ? (parsedAmount * 0.97).toFixed(6) : "0");

  const usdValue = parsedAmount > 0 ? parsedAmount.toFixed(2) : "0.00";

  const rate = quote?.details?.rate || "1";
  const impactPercent = quote?.details?.totalImpact?.percent || "0";

  const bridgeFee = quote?.fees?.relayer?.amountFormatted || "0";
  const gasFee = quote?.fees?.gas?.amountFormatted || "0";
  const bridgeFeeCurrency = quote?.fees?.relayer?.currency?.symbol || "USDC";
  const gasFeeCurrency = quote?.fees?.gas?.currency?.symbol || "ETH";

  const estimatedTime = quote?.details?.timeEstimate
    ? `${Math.round(quote.details.timeEstimate / 1000)} seconds`
    : "60-90 seconds";

  const isBridgeStateValid = useCallback((): boolean => {
    return !!(
      account?.isConnected &&
      originNetwork &&
      destNetwork &&
      parsedAmount > 0 &&
      parsedAmount <= parsedBalance &&
      originNetwork !== destNetwork &&
      originAddress &&
      destAddress &&
      !isExecuting &&
      !isQuoting &&
      quote &&
      !quoteError
    );
  }, [
    account?.isConnected,
    originNetwork,
    destNetwork,
    parsedAmount,
    parsedBalance,
    originAddress,
    destAddress,
    isExecuting,
    isQuoting,
    quote,
    quoteError,
  ]);

  const handleMaxClick = useCallback(() => {
    if (parsedBalance > 0) {
      setAmount(originBalance);
    }
  }, [originBalance, parsedBalance]);

  const getNetwork = useCallback((networkId: string | null) => {
    if (!networkId) return undefined;
    return NETWORK_CONFIG[networkId as SupportedNetwork];
  }, []);

  const handleBridge = useCallback(async () => {
    if (!originNetwork || !quote) return;

    setTransactionState("sending");
    setCurrentStep("deposit");
    setTransactionHash("");
    setErrorMessage("");

    executeBridge({
      quote,
      originNetwork,
      onProgress: (progressData: ProgressData) => {
        const { steps, currentStep: currentProgressStep, currentStepItem, txHashes, error, refunded } = progressData;

        if (refunded) {
          setTransactionState("failed");
          setCurrentStep("failed");
          setErrorMessage("Transaction was refunded. Please try again.");
          console.error("Transaction was refunded");
          return;
        }

        if (error) {
          setTransactionState("failed");
          setCurrentStep("failed");
          setErrorMessage(error.message || "Transaction failed");
          console.error("Transaction error:", error);
          return;
        }

        if (txHashes && txHashes.length > 0) {
          setTransactionHash(txHashes[0].txHash);
        }

        if (currentProgressStep) {
          const stepId = currentProgressStep.id;

          if (stepId === "approve" || stepId.includes("approve")) {
            setCurrentStep("approve");
            setTransactionState("sending");
          } else if (stepId === "deposit" || stepId === "send") {
            setCurrentStep("deposit");
            setTransactionState("sending");
          } else if (stepId === "swap" || currentProgressStep.description?.toLowerCase().includes("bridge")) {
            setCurrentStep("fill");
            setTransactionState("checking");
          }

          if (currentProgressStep.error) {
            setTransactionState("failed");
            setCurrentStep("failed");
            setErrorMessage(currentProgressStep.error);
            console.error("Step error:", currentProgressStep.error);
            return;
          }
        }

        if (currentStepItem) {
          if (currentStepItem.error) {
            setTransactionState("failed");
            setCurrentStep("failed");
            setErrorMessage(currentStepItem.error);
            console.error("Step item error:", currentStepItem.error);
            return;
          }

          if (currentStepItem.checkStatus) {
            switch (currentStepItem.checkStatus) {
              case "refund":
                setTransactionState("failed");
                setCurrentStep("failed");
                setErrorMessage("Transaction was refunded");
                break;
              case "failure":
                setTransactionState("failed");
                setCurrentStep("failed");
                setErrorMessage("Transaction failed");
                break;
              case "delayed":
                console.warn("Transaction is delayed");
                break;
              case "success":
                break;
            }
          }
        }

        const allComplete = steps?.every((step) => step.items?.every((item) => item.status === "complete"));

        if (allComplete && steps && steps.length > 0) {
          setTransactionState("complete");
          setCurrentStep("complete");
        }
      },
    });
  }, [originNetwork, quote, executeBridge]);

  const resetToBridge = useCallback(() => {
    setTransactionState("idle");
    setCurrentStep("deposit");
    setAmount("");
    setOriginNetwork(null);
    setDestNetwork(null);
    setTransactionHash("");
    setErrorMessage("");
  }, []);

  if (transactionState !== "idle") {
    return (
      <TransactionProcessing
        amount={amount}
        asset={ASSET_DETAILS["usdc"]}
        originNetwork={getNetwork(originNetwork)}
        destNetwork={getNetwork(destNetwork)}
        transactionHash={transactionHash}
        currentStep={currentStep}
        transactionState={transactionState}
        onReset={resetToBridge}
        errorMessage={errorMessage}
      />
    );
  }

  return (
    <>
      <BridgeForm
        isConnected={account?.isConnected || false}
        isValid={isBridgeStateValid()}
        onConnect={() => {
          openModal();
        }}
        onBridge={handleBridge}>
        <AssetDisplay asset={ASSET_DETAILS["usdc"]} />

        <NetworkSelector
          originNetwork={originNetwork}
          destNetwork={destNetwork}
          originAddress={originAddress}
          destAddress={destAddress}
          originBalance={originBalance}
          destBalance={destBalance}
          isConnected={account?.isConnected || false}
          onOriginChange={setOriginNetwork}
          onDestChange={setDestNetwork}
        />

        <AmountInput
          amount={amount}
          usdValue={usdValue}
          isConnected={account?.isConnected || false}
          onAmountChange={setAmount}
          onMaxClick={handleMaxClick}
        />

        {amount && parsedAmount > 0 && (
          <ReceiveAmount
            destAmount={destAmount}
            asset={ASSET_DETAILS["usdc"]}
            rate={rate}
            impactPercent={impactPercent}
          />
        )}

        <TransactionDetails
          isOpen={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          bridgeFee={bridgeFee}
          gasFee={gasFee}
          estimatedTime={estimatedTime}
          bridgeFeeCurrency={bridgeFeeCurrency}
          gasFeeCurrency={gasFeeCurrency}
        />
      </BridgeForm>
      <ParaModal
        disableEmailLogin={false}
        disablePhoneLogin={false}
        authLayout={[AuthLayout.AUTH_FULL]}
        oAuthMethods={[
          OAuthMethod.APPLE,
          OAuthMethod.DISCORD,
          OAuthMethod.FACEBOOK,
          OAuthMethod.FARCASTER,
          OAuthMethod.GOOGLE,
          OAuthMethod.TWITTER,
        ]}
        onRampTestMode={true}
        theme={{
          foregroundColor: "#2D3648",
          backgroundColor: "#FFFFFF",
          accentColor: "#0066CC",
          darkForegroundColor: "#E8EBF2",
          darkBackgroundColor: "#1A1F2B",
          darkAccentColor: "#4D9FFF",
          mode: "light",
          borderRadius: "lg",
          font: "Inter",
        }}
        appName="Para Modal Example"
        logo="/para.svg"
        recoverySecretStepEnabled={true}
        twoFactorAuthEnabled={false}
      />
    </>
  );
}
