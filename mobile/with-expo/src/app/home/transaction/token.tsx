import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { WalletType } from "@getpara/react-native-wallet";

import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { TokenList } from "@/components/transaction/TokenList";
import { TokenItemProps } from "@/components/transaction/TokenItem";
import { useWallets } from "@/hooks/useWallets";
import { useBalances } from "@/hooks/useBalances";
import { usePrices } from "@/hooks/usePrices";
import { formatTokenAmount } from "@/utils/formattingUtils";

type TokenData = Omit<TokenItemProps, "isSelected" | "onSelect" | "disabled">;

export default function TokenSelectionScreen() {
  const router = useRouter();
  const { hasEvmWallets, hasSolanaWallets } = useWallets();
  const { totalEthBalance, totalSolBalance, isBalancesLoading } = useBalances();
  const { prices, isPricesLoading } = usePrices();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const tokens: TokenData[] = useMemo(() => {
    const list: TokenData[] = [];
    if (hasEvmWallets) {
      const amount = parseFloat(formatTokenAmount(totalEthBalance, 18));
      list.push({
        id: "eth",
        name: "Ethereum",
        ticker: "ETH",
        logo: require("~/assets/ethereum.png"),
        networkType: WalletType.EVM,
        networkLogo: require("~/assets/ethereum.png"),
        balance: amount,
        usdValue: prices.ethereum?.usd ? amount * prices.ethereum.usd : null,
        isLoading: isBalancesLoading || isPricesLoading,
      });
    }
    if (hasSolanaWallets) {
      const amount = parseFloat(formatTokenAmount(totalSolBalance, 9));
      list.push({
        id: "sol",
        name: "Solana",
        ticker: "SOL",
        logo: require("~/assets/solana.png"),
        networkType: WalletType.SOLANA,
        networkLogo: require("~/assets/solana.png"),
        balance: amount,
        usdValue: prices.solana?.usd ? amount * prices.solana.usd : null,
        isLoading: isBalancesLoading || isPricesLoading,
      });
    }
    return list;
  }, [hasEvmWallets, hasSolanaWallets, totalEthBalance, totalSolBalance, prices, isBalancesLoading, isPricesLoading]);

  const handleContinue = () => {
    if (!selectedId) return;
    const networkType = selectedId === "eth" ? WalletType.EVM : WalletType.SOLANA;
    router.navigate({
      pathname: "/home/transaction/create",
      params: { networkType },
    });
  };

  return (
    <View className="flex-1 bg-background px-6 pt-6">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-foreground">Select Token</Text>
      </View>
      <TokenList
        tokens={tokens}
        isLoading={isBalancesLoading || isPricesLoading}
        onSelectToken={setSelectedId}
        selectedTokenId={selectedId || undefined}
      />
      <View className="mt-6">
        <Button onPress={handleContinue} disabled={!selectedId}>
          <Text className="text-primary-foreground font-medium">Continue</Text>
        </Button>
      </View>
    </View>
  );
}
