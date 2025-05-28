import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TransactionDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bridgeFee?: string;
  gasFee?: string;
  estimatedTime?: string;
  bridgeFeeCurrency?: string;
  gasFeeCurrency?: string;
}

export function TransactionDetails({
  isOpen,
  onOpenChange,
  bridgeFee = "0",
  gasFee = "0",
  estimatedTime = "60-90 seconds",
  bridgeFeeCurrency = "USDC",
  gasFeeCurrency = "ETH",
}: TransactionDetailsProps) {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onOpenChange}
      className="bg-gray-50 rounded-2xl overflow-hidden">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto rounded-2xl hover:bg-gray-100 transition-colors">
          <span className="font-medium text-gray-700">Transaction Details</span>
          <ChevronDown className={`h-4 w-4 transition-transform text-gray-500 ${isOpen ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Bridge Fee</span>
          <span className="font-medium text-gray-900">
            {bridgeFee} {bridgeFeeCurrency}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Gas Fee</span>
          <span className="font-medium text-gray-900">
            {gasFee} {gasFeeCurrency}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Estimated Time</span>
          <span className="font-medium text-gray-900">{estimatedTime}</span>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
