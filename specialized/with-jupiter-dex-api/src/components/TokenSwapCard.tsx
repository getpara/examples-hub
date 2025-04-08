"use client";

import { useState, useEffect } from "react";
import { ArrowUpDownIcon } from "lucide-react";
import SwapAmountInput from "@/components/ui/SwapAmountInput";
import TransactionDetailsCollapsible from "@/components/ui/TransactionDetailsCollapsible";
import { usePara } from "./ParaProvider";
import { VersionedTransaction } from "@solana/web3.js";
import { Token, TokenApiResponse } from "@/types";

export default function TokenSwapCard() {
  const { signer, connection, isConnected, openModal, address } = usePara();

  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [swapStatus, setSwapStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [quoteData, setQuoteData] = useState<any>(null);

  useEffect(() => {
    async function fetchTokens() {
      try {
        const response = await fetch("/api/jupiter/tokens");
        if (!response.ok) {
          throw new Error("Failed to fetch tokens");
        }

        const tokensData: TokenApiResponse[] = await response.json();

        const transformedTokens: Token[] = tokensData.map((token) => ({
          id: token.address,
          name: token.name || "Unknown",
          symbol: token.symbol || "???",
          balance: 0,
          value: 0,
          icon: token.logoURI || "/placeholder.svg?height=32&width=32",
          address: token.address,
          decimals: token.decimals,
        }));

        // default tokens (SOL and USDC)
        const solToken = transformedTokens.find((t) => t.symbol === "SOL");
        const usdcToken = transformedTokens.find((t) => t.symbol === "USDC");

        setTokens(transformedTokens);
        if (solToken) setFromToken(solToken);
        if (usdcToken) setToToken(usdcToken);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching tokens:", error);
        setIsLoading(false);
      }
    }

    fetchTokens();
  }, []);

  useEffect(() => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount("");
      setQuoteData(null);
      return;
    }

    const rawAmount = Math.floor(parseFloat(fromAmount) * Math.pow(10, fromToken.decimals)).toString();

    const getQuote = async () => {
      try {
        const response = await fetch("/api/jupiter/quote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputMint: fromToken.address,
            outputMint: toToken.address,
            amount: rawAmount,
            slippageBps: Math.round(slippage * 100),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get quote");
        }

        const data = await response.json();
        setQuoteData(data);

        const calculatedOutputAmount = parseFloat(data.outAmount) / Math.pow(10, toToken.decimals);
        setToAmount(calculatedOutputAmount.toFixed(toToken.decimals <= 6 ? toToken.decimals : 6));
      } catch (error) {
        console.error("Error getting quote:", error);
        setToAmount("");
        setQuoteData(null);
      }
    };

    getQuote();
  }, [fromToken, toToken, fromAmount, slippage]);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
  };

  const switchTokens = () => {
    if (!fromToken || !toToken) return;

    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);

    setFromAmount("");
    setToAmount("");
  };

  const handleSwap = async () => {
    if (!isConnected) {
      openModal();
      return;
    }

    if (!quoteData || !signer || !connection || !address) {
      setErrorMessage("Cannot perform swap: missing quote data or wallet not connected");
      return;
    }

    setSwapStatus("loading");
    setErrorMessage("");

    try {
      const swapResponse = await fetch("/api/jupiter/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse: quoteData,
          userPublicKey: address,
        }),
      });

      if (!swapResponse.ok) {
        throw new Error("Failed to get swap transaction");
      }

      const swapData = await swapResponse.json();
      console.log("Swap Data:", swapData);

      const base64Transaction = Buffer.from(swapData.swapTransaction, "base64");

      console.log("Base64 Transaction:", base64Transaction);

      const transaction = VersionedTransaction.deserialize(base64Transaction);

      console.log("Transaction:", transaction);

      const signedTransaction = await signer.signVersionedTransaction(transaction);

      console.log("Signed Transaction:", signedTransaction);

      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: true,
        maxRetries: 3,
      });

      console.log("Transaction Signature:", signature);

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      const confirmationStrategy = {
        signature,
        blockhash,
        lastValidBlockHeight,
      };

      const confirmation = await connection.confirmTransaction(confirmationStrategy, "confirmed");

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      setSwapStatus("success");

      // Reset form after successful swap
      setTimeout(() => {
        setFromAmount("");
        setToAmount("");
        setSwapStatus("idle");
      }, 2000);
    } catch (error: any) {
      console.error("Swap error:", error);
      setSwapStatus("error");
      setErrorMessage(error.message || "Failed to execute swap");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md shadow-lg border bg-white p-6">
        <p className="text-center">Loading tokens...</p>
      </div>
    );
  }

  const exchangeRate = fromAmount && toAmount ? (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6) : "0";

  return (
    <div className="w-full max-w-md shadow-lg border bg-white">
      <div className="p-6 pb-2">
        <h2 className="text-2xl font-semibold">Swap Tokens</h2>
        <p className="text-sm text-gray-500">Trade tokens with the best rates using Jupiter DEX</p>
      </div>

      <div className="p-6 space-y-4">
        <div className="relative">
          {/* From token */}
          {fromToken && (
            <SwapAmountInput
              label="From"
              tokens={tokens}
              selectedToken={fromToken}
              onSelectToken={setFromToken}
              amount={fromAmount}
              onAmountChange={handleFromAmountChange}
            />
          )}

          {/* To token */}
          <div className="mt-1">
            {toToken && (
              <SwapAmountInput
                label="To"
                tokens={tokens}
                selectedToken={toToken}
                onSelectToken={setToToken}
                amount={toAmount}
                onAmountChange={handleToAmountChange}
              />
            )}
          </div>

          {/* Swap direction button */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button
              className="flex items-center justify-center h-10 w-10 bg-white border-2 border-gray-200 shadow-md hover:bg-gray-50 focus:outline-none"
              onClick={switchTokens}>
              <ArrowUpDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Exchange rate */}
        {fromToken && toToken && fromAmount && toAmount && (
          <div className="flex items-center justify-between p-2 text-sm">
            <span className="text-gray-500">Exchange Rate</span>
            <span>
              1 {fromToken.symbol} ≈ {exchangeRate} {toToken.symbol}
            </span>
          </div>
        )}

        {/* Transaction Details */}
        {fromToken && toToken && fromAmount && toAmount && (
          <TransactionDetailsCollapsible
            fromToken={fromToken}
            toToken={toToken}
            fromAmount={fromAmount}
            toAmount={toAmount}
            slippage={slippage}
          />
        )}

        {/* Error message */}
        {errorMessage && <div className="p-2 text-sm text-red-600 bg-red-50 border border-red-200">{errorMessage}</div>}
      </div>

      <div className="p-6">
        <button
          onClick={handleSwap}
          disabled={swapStatus === "loading" || !fromAmount || !toAmount}
          className={`w-full font-medium py-3 focus:outline-none ${
            !isConnected
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : swapStatus === "loading"
              ? "bg-gray-400 text-white cursor-not-allowed"
              : swapStatus === "success"
              ? "bg-green-600 text-white"
              : swapStatus === "error"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}>
          {!isConnected
            ? "Connect Wallet"
            : swapStatus === "loading"
            ? "Swapping..."
            : swapStatus === "success"
            ? "Swap Successful!"
            : swapStatus === "error"
            ? "Try Again"
            : "Swap"}
        </button>
      </div>
    </div>
  );
}
