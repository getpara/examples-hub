"use client";

import { useState, useCallback } from "react";
import { useAccount, useWallet, useModal } from "@getpara/react-sdk";
import { SupportedNetwork, NETWORK_CONFIG, ASSET_DETAILS } from "@/config/constants";
import { useSquidBridge } from "@/hooks/useSquidBridge";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { TransactionProcessing } from "@/components/TransactionProcessing";
import { BridgeForm } from "@/components/BridgeForm";
import { AssetDisplay } from "@/components/AssetDisplay";
import { NetworkSelector } from "@/components/NetworkSelector";
import { AmountInput } from "@/components/AmountInput";
import { ReceiveAmount } from "@/components/ReceiveAmount";
import { TransactionDetails } from "@/components/TransactionDetails";
import { useSigners } from "@/hooks/useSigners";
import { Info } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type TransactionState = "idle" | "sending" | "checking" | "complete" | "failed";
type StepType =
  | "approve"
  | "deposit"
  | "processing"
  | "fill"
  | "complete"
  | "failed"
  | "partial"
  | "refunded"
  | "needs_gas"
  | "timeout";

export default function Home() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const { useQuote, executeBridge, isExecuting } = useSquidBridge();
  const { ethereumEthers, baseEthers, solanaSvm } = useSigners();

  const [originNetwork, setOriginNetwork] = useState<SupportedNetwork | null>(null);
  const [destNetwork, setDestNetwork] = useState<SupportedNetwork | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [transactionState, setTransactionState] = useState<TransactionState>("idle");
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<StepType>("deposit");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [axelarScanUrl, setAxelarScanUrl] = useState<string>("");

  const getNetworkAddress = useCallback(
    (networkId: SupportedNetwork | null): string | null => {
      if (!networkId) return null;
      switch (networkId) {
        case "ethereum":
          return ethereumEthers.address;
        case "base":
          return baseEthers.address;
        case "solana":
          return solanaSvm.address;
        default:
          return null;
      }
    },
    [ethereumEthers.address, baseEthers.address, solanaSvm.address]
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

  const route = quote?.route;
  const destAmount = route?.estimate?.toAmountMin
    ? (parseFloat(route.estimate.toAmountMin) / 1e6).toFixed(6)
    : parsedAmount > 0
    ? (parsedAmount * 0.97).toFixed(6)
    : "0";
  const usdValue = parsedAmount > 0 ? parsedAmount.toFixed(2) : "0.00";
  const rate = route?.estimate?.exchangeRate || "1";
  const impactPercent = route?.estimate?.aggregatePriceImpact || "0";
  const bridgeFee = route?.estimate?.feeCosts?.[0]?.amount
    ? (parseFloat(route.estimate.feeCosts[0].amount) / 1e6).toFixed(6)
    : "0";
  const gasFee = route?.estimate?.gasCosts?.[0]?.amountUsd || "0";
  const bridgeFeeCurrency = route?.estimate?.feeCosts?.[0]?.token?.symbol || "USDC";
  const gasFeeCurrency = "USD";
  const estimatedTime = route?.estimate?.estimatedRouteDuration
    ? `${Math.round(route.estimate.estimatedRouteDuration)} seconds`
    : "60-90 seconds";

  const isBridgeStateValid = useCallback((): boolean => {
    return !!(
      isConnected &&
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
    isConnected,
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
    if (!originNetwork || !destNetwork || !quote) return;

    setTransactionState("sending");
    setCurrentStep("deposit");
    setTransactionHash("");
    setErrorMessage("");
    setAxelarScanUrl("");

    executeBridge({
      quote,
      originNetwork,
      destNetwork,
      onProgress: (progressData: any) => {
        const { steps, currentStep: progressStep, txHashes, error, axelarScanUrl: scanUrl } = progressData;

        if (txHashes && txHashes.length > 0) {
          setTransactionHash(txHashes[0].txHash);
        }

        if (error) {
          setTransactionState("failed");
          setErrorMessage(error.message || "Transaction failed");

          if (progressStep?.id === "needs_gas") {
            setCurrentStep("needs_gas");
            if (scanUrl) setAxelarScanUrl(scanUrl);
          } else if (progressStep?.id === "partial") {
            setCurrentStep("partial");
          } else if (progressStep?.id === "refunded") {
            setCurrentStep("refunded");
          } else if (progressStep?.id === "timeout") {
            setCurrentStep("timeout");
          } else {
            setCurrentStep("failed");
          }
          return;
        }

        if (progressStep?.id === "complete") {
          setTransactionState("complete");
          setCurrentStep("complete");
          return;
        }

        if (progressStep?.id) {
          switch (progressStep.id) {
            case "deposit":
              setCurrentStep("deposit");
              setTransactionState("sending");
              break;
            case "processing":
              setCurrentStep("processing");
              setTransactionState("checking");
              break;
            case "fill":
              setCurrentStep("fill");
              setTransactionState("checking");
              break;
            default:
              break;
          }
        }
      },
    });
  }, [originNetwork, destNetwork, quote, executeBridge]);

  const resetToBridge = useCallback(() => {
    setTransactionState("idle");
    setCurrentStep("deposit");
    setAmount("");
    setOriginNetwork(null);
    setDestNetwork(null);
    setTransactionHash("");
    setErrorMessage("");
    setAxelarScanUrl("");
  }, []);

  if (transactionState !== "idle") {
    return (
      <TransactionProcessing
        amount={amount}
        asset={ASSET_DETAILS.usdc}
        originNetwork={getNetwork(originNetwork)}
        destNetwork={getNetwork(destNetwork)}
        transactionHash={transactionHash}
        currentStep={currentStep}
        transactionState={transactionState}
        onReset={resetToBridge}
        errorMessage={errorMessage}
        axelarScanUrl={axelarScanUrl}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-start justify-center space-x-6">
          <div className="w-1/3">
            <Alert className="border-orange-400 bg-orange-50">
              <Info className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" />
              <div>
                <AlertTitle>⚠️ MAINNET - Real Funds Required</AlertTitle>
                <AlertDescription>
                  This uses REAL MAINNET funds. SQUID only supports mainnet. Ensure you have: • USDC on your source
                  chain • Native tokens for gas fees • Double-check addresses before sending
                </AlertDescription>
              </div>
            </Alert>
          </div>

          <div className="flex-1">
            <BridgeForm
              isConnected={isConnected || false}
              isValid={isBridgeStateValid()}
              onConnect={openModal}
              onBridge={handleBridge}>
              <AssetDisplay asset={ASSET_DETAILS.usdc} />

              <NetworkSelector
                originNetwork={originNetwork}
                destNetwork={destNetwork}
                originAddress={originAddress}
                destAddress={destAddress}
                originBalance={originBalance}
                destBalance={destBalance}
                isConnected={isConnected || false}
                onOriginChange={setOriginNetwork}
                onDestChange={setDestNetwork}
              />

              <AmountInput
                amount={amount}
                usdValue={usdValue}
                isConnected={isConnected || false}
                onAmountChange={setAmount}
                onMaxClick={handleMaxClick}
              />

              {amount && parsedAmount > 0 && (
                <ReceiveAmount
                  destAmount={destAmount}
                  asset={ASSET_DETAILS.usdc}
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
          </div>
        </div>
      </div>

    </div>
  );
}
