"use client";
import { useState } from "react";
import { ArrowDown, Info } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";

type Token = {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  icon: string;
};

interface TransactionDetailsCollapsibleProps {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  slippage: number;
}

export default function TransactionDetailsCollapsible({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  slippage,
}: TransactionDetailsCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate fee
  const fee = Number.parseFloat(fromAmount || "0") * 0.003;
  const feeInUsd = fee * (fromToken.value / fromToken.balance);

  // Calculate minimum received
  const minimumReceived = (Number.parseFloat(toAmount || "0") * (1 - slippage / 100)).toFixed(4);

  return (
    <div className="border p-2">
      <button
        className="flex w-full items-center justify-between text-sm"
        onClick={() => setIsOpen(!isOpen)}>
        <span className="font-medium">Transaction Details</span>
        <div className="h-7 w-7 p-0 flex items-center justify-center">
          <ArrowDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isOpen && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Estimated Fee</span>
              <Tooltip content="0.3% fee on all swaps">
                <Info className="h-3 w-3 text-gray-500" />
              </Tooltip>
            </div>
            <span>
              {fee.toFixed(6)} {fromToken.symbol} (≈${feeInUsd.toFixed(2)})
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Slippage Tolerance</span>
              <Tooltip content="Maximum price change you're willing to accept">
                <Info className="h-3 w-3 text-gray-500" />
              </Tooltip>
            </div>
            <span>{slippage}%</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Minimum Received</span>
            <span>
              {minimumReceived} {toToken.symbol}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
