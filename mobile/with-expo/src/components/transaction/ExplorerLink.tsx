import React from "react";
import { View, Pressable, Linking } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { WalletType } from "@getpara/react-native-wallet";
import { ArrowUpRight, ExternalLink } from "@/components/icons";
import { getExplorerUrl } from "@/utils/transactionUtils";
import { SupportedWalletType } from "@/types";

export type ExplorerLinkVariant = "button" | "text" | "compact";

export interface ExplorerLinkProps {
  txHash: string;
  networkType: SupportedWalletType;
  networkId?: string | number;
  variant?: ExplorerLinkVariant;
  label?: string;
  showExplorerName?: boolean;
  className?: string;
  textClassName?: string;
  truncate?: boolean;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost";
}

export function ExplorerLink({
  txHash,
  networkType,
  networkId,
  variant = "button",
  label,
  showExplorerName = true,
  className = "",
  textClassName = "",
  truncate = true,
  buttonVariant = "outline",
}: ExplorerLinkProps) {
  const explorerUrl = getExplorerUrl(networkType, txHash, networkId);

  const getExplorerName = () => {
    if (networkType === WalletType.EVM) {
      return networkId === "5" || networkId === 5
        ? "Goerli Etherscan"
        : networkId === "11155111" || networkId === 11155111
        ? "Sepolia Etherscan"
        : "Etherscan";
    } else if (networkType === WalletType.SOLANA) {
      return "Solana Explorer";
    }
    return "Block Explorer";
  };

  const getDisplayHash = () => {
    if (!truncate) return txHash;
    if (txHash.length <= 16) return txHash;

    return `${txHash.substring(0, 8)}...${txHash.substring(txHash.length - 8)}`;
  };

  const handlePress = async () => {
    if (!explorerUrl) return;

    try {
      const canOpen = await Linking.canOpenURL(explorerUrl);
      if (canOpen) {
        await Linking.openURL(explorerUrl);
      } else {
        console.error("Cannot open URL:", explorerUrl);
      }
    } catch (error) {
      console.error("Error opening explorer URL:", error);
    }
  };

  if (variant === "button") {
    return (
      <Button
        variant={buttonVariant}
        className={className}
        onPress={handlePress}
        accessibilityLabel={`View transaction in ${getExplorerName()}`}>
        <ExternalLink
          size={18}
          className="text-foreground mr-2"
        />
        <Text
          className={`font-medium ${
            buttonVariant === "default" ? "text-primary-foreground" : "text-foreground"
          } ${textClassName}`}>
          {label || (showExplorerName ? `View in ${getExplorerName()}` : "View in Explorer")}
        </Text>
      </Button>
    );
  }

  if (variant === "compact") {
    return (
      <Pressable
        onPress={handlePress}
        className={`flex-row items-center ${className}`}
        accessibilityLabel={`View transaction in ${getExplorerName()}`}>
        <Text className={`text-primary ${textClassName}`}>{getDisplayHash()}</Text>
        <ArrowUpRight
          size={16}
          className="text-primary ml-1"
        />
      </Pressable>
    );
  }

  return (
    <View className={className}>
      {label && <Text className="text-sm text-muted-foreground mb-1">{label}</Text>}

      <Pressable
        onPress={handlePress}
        className="flex-row items-center"
        accessibilityLabel={`View transaction in ${getExplorerName()}`}>
        <Text className={`text-primary ${textClassName}`}>
          {showExplorerName ? `View in ${getExplorerName()}` : "View in Explorer"}
        </Text>
        <ArrowUpRight
          size={16}
          className="text-primary ml-1"
        />
      </Pressable>
    </View>
  );
}
