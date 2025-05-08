import React from "react";
import { View, Image } from "react-native";
import { Text } from "~/components/ui/text";
import { Option, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Wallet, WalletType } from "@getpara/react-native-wallet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WalletWithBalance } from "@/types";

interface WalletSelectProps {
  wallets: WalletWithBalance[];
  selectedWallet: Wallet | null;
  onWalletChange: (wallet: WalletWithBalance | null) => void;
}

const WalletTypeIcon = ({ type }: { type: WalletType | "ALL" }) => {
  const getIcon = () => {
    switch (type) {
      case WalletType.EVM:
        return require("~/assets/ethereum.png");
      case WalletType.SOLANA:
        return require("~/assets/solana.png");
      case WalletType.COSMOS:
        return require("~/assets/cosmos.png");
      case "ALL":
        return require("~/assets/para.png");
      default:
        return null;
    }
  };

  const icon = getIcon();

  if (!icon) return null;

  return (
    <Image
      source={icon}
      style={{ width: 24, height: 24 }}
      resizeMode="contain"
    />
  );
};

const formatAddress = (address: string) => {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export function WalletSelect({ wallets, selectedWallet, onWalletChange }: WalletSelectProps) {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const allWalletsOption = {
    value: "all",
    label: "All Wallets",
    wallet: null,
  };

  const walletOptions = wallets.map((wallet) => ({
    value: wallet.id,
    label: `${wallet.type} ${formatAddress(wallet.address!)}`,
    wallet: wallet,
  }));

  const options = [allWalletsOption, ...walletOptions];

  const selectedOption = selectedWallet ? options.find((opt) => opt.value === selectedWallet.id) : allWalletsOption;

  const handleChange = (option: Option | undefined) => {
    if (!option || option.value === "all") {
      onWalletChange(null);
    } else {
      const selectedWalletItem = wallets.find((w) => w.id === option.value);
      onWalletChange(selectedWalletItem || null);
    }
  };

  const renderCustomValue = () => {
    if (!selectedWallet) {
      return (
        <View className="flex-row items-center gap-2">
          <WalletTypeIcon type="ALL" />
          <Text className="text-foreground">All Wallets</Text>
        </View>
      );
    }

    return (
      <View className="flex-row items-center gap-2">
        <WalletTypeIcon type={selectedWallet.type || "ALL"} />
        <Text className="text-foreground">{selectedWallet.type}</Text>
        <Text className="text-muted-foreground">{formatAddress(selectedWallet.address || "")}</Text>
      </View>
    );
  };

  return (
    <View className="w-full mb-8">
      <Select
        value={selectedOption}
        onValueChange={handleChange}>
        <SelectTrigger className="w-full py-4">
          <SelectValue
            className="text-foreground text-sm native:text-lg"
            placeholder="Select wallet">
            {renderCustomValue()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          insets={contentInsets}
          className="w-full">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              label={option.label}>
              <View className="flex-row items-center gap-2 py-1">
                <WalletTypeIcon
                  type={
                    option.value === "all" ? "ALL" : wallets.find((w) => w.id === option.value)?.type || WalletType.EVM
                  }
                />
                <Text className="font-medium">
                  {option.value === "all" ? "All Wallets" : wallets.find((w) => w.id === option.value)?.type}
                </Text>
                {option.value !== "all" && (
                  <Text className="text-muted-foreground ml-auto">
                    {formatAddress(wallets.find((w) => w.id === option.value)?.address || "")}
                  </Text>
                )}
              </View>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </View>
  );
}
