import { ArrowUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NETWORK_CONFIG, SupportedNetwork } from "@/constants";
import { useState, useCallback } from "react";

interface NetworkSelectorProps {
  originNetwork: SupportedNetwork | null;
  destNetwork: SupportedNetwork | null;
  originAddress: string | null;
  destAddress: string | null;
  originBalance?: string;
  destBalance?: string;
  isConnected: boolean;
  onOriginChange: (value: SupportedNetwork) => void;
  onDestChange: (value: SupportedNetwork) => void;
}

export function NetworkSelector({
  originNetwork,
  destNetwork,
  originAddress,
  destAddress,
  originBalance,
  destBalance,
  isConnected,
  onOriginChange,
  onDestChange,
}: NetworkSelectorProps) {
  const [copiedAddress, setCopiedAddress] = useState<"origin" | "dest" | null>(null);

  const handleCopyAddress = useCallback(async (address: string, type: "origin" | "dest") => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(type);
      setTimeout(() => {
        setCopiedAddress(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  }, []);

  const formatAddress = useCallback((address: string | null) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }, []);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-3 items-center">
        <div className="col-span-3 space-y-2">
          <Label className="text-sm font-medium text-gray-700">From</Label>
          <Select
            value={originNetwork || ""}
            onValueChange={onOriginChange}
            disabled={!isConnected}>
            <SelectTrigger className="h-14 bg-gray-50 border-0 rounded-2xl hover:bg-gray-100 transition-colors">
              {originNetwork ? (
                <div className="flex items-center gap-3">
                  <img
                    src={NETWORK_CONFIG[originNetwork].icon}
                    alt={NETWORK_CONFIG[originNetwork].name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium text-gray-900 truncate">{NETWORK_CONFIG[originNetwork].name}</span>
                </div>
              ) : (
                <SelectValue placeholder="Add Network" />
              )}
            </SelectTrigger>
            <SelectContent>
              {Object.entries(NETWORK_CONFIG).map(([networkKey, network]) => (
                <SelectItem
                  key={networkKey}
                  value={networkKey}>
                  <div className="flex items-center gap-3">
                    <img
                      src={network.icon}
                      alt={network.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="truncate">{network.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1 flex justify-center items-center">
          <div className="bg-gray-100 rounded-full p-2 mt-6">
            <ArrowUpDown className="h-4 w-4 text-gray-600" />
          </div>
        </div>

        <div className="col-span-3 space-y-2">
          <Label className="text-sm font-medium text-gray-700">To</Label>
          <Select
            value={destNetwork || ""}
            onValueChange={onDestChange}
            disabled={!isConnected || !originNetwork}>
            <SelectTrigger className="h-14 bg-gray-50 border-0 rounded-2xl hover:bg-gray-100 transition-colors">
              {destNetwork ? (
                <div className="flex items-center gap-3">
                  <img
                    src={NETWORK_CONFIG[destNetwork].icon}
                    alt={NETWORK_CONFIG[destNetwork].name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium text-gray-900 truncate">{NETWORK_CONFIG[destNetwork].name}</span>
                </div>
              ) : (
                <SelectValue placeholder="Add Network" />
              )}
            </SelectTrigger>
            <SelectContent>
              {Object.entries(NETWORK_CONFIG)
                .filter(([networkKey]) => networkKey !== originNetwork)
                .map(([networkKey, network]) => (
                  <SelectItem
                    key={networkKey}
                    value={networkKey}>
                    <div className="flex items-center gap-3">
                      <img
                        src={network.icon}
                        alt={network.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="truncate">{network.name}</span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        <div className="col-span-3">
          {originNetwork && originAddress && (
            <div className="text-xs text-gray-500 ml-2 space-y-1">
              <div
                className="font-medium cursor-pointer hover:text-gray-700 transition-colors"
                onClick={() => handleCopyAddress(originAddress, "origin")}
                title="Click to copy address">
                {copiedAddress === "origin" ? (
                  <span className="text-green-600">Copied!</span>
                ) : (
                  formatAddress(originAddress)
                )}
              </div>
              <div className="font-semibold">Balance: {originBalance || "0"} USDC</div>
            </div>
          )}
        </div>
        <div className="col-span-1"></div>
        <div className="col-span-3">
          {destNetwork && destAddress && (
            <div className="text-xs text-gray-500 ml-2 space-y-1">
              <div
                className="font-medium cursor-pointer hover:text-gray-700 transition-colors"
                onClick={() => handleCopyAddress(destAddress, "dest")}
                title="Click to copy address">
                {copiedAddress === "dest" ? (
                  <span className="text-green-600">Copied!</span>
                ) : (
                  formatAddress(destAddress)
                )}
              </div>
              <div className="font-semibold">Balance: {destBalance || "0"} USDC</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
