"use client";
import TokenSelector from "@/components/ui/TokenSelector";
import { Token } from "@/types";

interface SwapAmountInputProps {
  label: string;
  tokens: Token[];
  selectedToken: Token;
  onSelectToken: (token: Token) => void;
  amount: string;
  onAmountChange: (value: string) => void;
}

export default function SwapAmountInput({
  label,
  tokens,
  selectedToken,
  onSelectToken,
  amount,
  onAmountChange,
}: SwapAmountInputProps) {
  const estimatedValue = (Number.parseFloat(amount) || 0) * (selectedToken.value / selectedToken.balance);

  return (
    <div className="border bg-white">
      <div className="flex items-center justify-between p-3 pb-0">
        <label className="text-sm font-medium text-gray-500">{label}</label>
        <span className="text-xs text-gray-500">
          Balance: {selectedToken.balance} {selectedToken.symbol}
        </span>
      </div>
      <div className="grid grid-cols-[1fr,auto] h-20">
        <div className="h-full">
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="h-full w-full border-none text-2xl font-medium shadow-none focus:outline-none px-3"
            placeholder="0.0"
          />
        </div>

        <div className="flex flex-col justify-between p-3 pt-0">
          <div>
            <TokenSelector
              selectedToken={selectedToken}
              tokens={tokens}
              onSelect={onSelectToken}
            />
          </div>
          <div className="text-right text-xs text-gray-500 whitespace-nowrap">≈ ${estimatedValue.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
