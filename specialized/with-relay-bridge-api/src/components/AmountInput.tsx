import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AmountInputProps {
  amount: string;
  usdValue: string;
  isConnected: boolean;
  onAmountChange: (value: string) => void;
  onMaxClick: () => void;
}

export function AmountInput({ amount, usdValue, isConnected, onAmountChange, onMaxClick }: AmountInputProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">Amount</Label>
      <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="border-0 bg-transparent p-0 text-3xl font-bold h-10 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-900 placeholder:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            disabled={!isConnected}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-sm px-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold"
            onClick={onMaxClick}
            disabled={!isConnected}>
            MAX
          </Button>
        </div>
        <div className="text-sm text-gray-500 font-medium">${usdValue} USD</div>
      </div>
    </div>
  );
}
