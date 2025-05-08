import React, { useState, useMemo } from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { WalletSelect } from "~/components/WalletSelect";
import { BalanceDisplay } from "~/components/BalanceDisplay";
import { ActionButtons } from "~/components/ActionButtons";
import { WalletType } from "@getpara/react-native-wallet";
import { useWallet } from "@/providers/wallet/useWallet";
import { WalletWithBalance } from "@/types";
import { Button } from "@/components/ui/button";
import { usePara } from "@/providers/para/usePara";

export default function HomeScreen() {
  const { wallets } = useWallet();
  const { logout } = usePara();
  const [selectedWallet, setSelectedWallet] = useState<WalletWithBalance | null>(null);

  const allWallets = useMemo(() => {
    const walletArray: WalletWithBalance[] = [];
    Object.values(WalletType).forEach((type) => {
      wallets[type].forEach((wallet) => {
        walletArray.push(wallet);
      });
    });
    return walletArray;
  }, [wallets]);

  const formatBalance = (amount: string, decimals: number): number => {
    const parsed = parseInt(amount);
    if (isNaN(parsed)) return 0;
    return parsed / Math.pow(10, decimals);
  };

  const currentBalance = useMemo(() => {
    if (selectedWallet && !selectedWallet.isLoadingBalance && selectedWallet.balance) {
      const balance = formatBalance(selectedWallet.balance.amount, selectedWallet.balance.decimals);
      const change = balance * 0.02;
      const percentage = 2.0;

      return {
        total: balance,
        change,
        percentage,
        isPositive: change >= 0,
      };
    } else if (!selectedWallet) {
      let totalBalance = 0;
      let totalChange = 0;

      Object.values(WalletType).forEach((type) => {
        wallets[type].forEach((wallet) => {
          if (!wallet.isLoadingBalance && wallet.balance) {
            const balance = formatBalance(wallet.balance.amount, wallet.balance.decimals);
            totalBalance += balance;
            totalChange += balance * 0.02;
          }
        });
      });

      const percentage = totalBalance > 0 ? (totalChange / totalBalance) * 100 : 0;

      return {
        total: totalBalance,
        change: totalChange,
        percentage,
        isPositive: totalChange >= 0,
      };
    } else {
      return {
        total: 0,
        change: 0,
        percentage: 0,
        isPositive: true,
      };
    }
  }, [selectedWallet, wallets]);

  return (
    <View className="flex-1 bg-background px-6">
      <View className="flex-1 items-center justify-center">
        <WalletSelect
          wallets={allWallets}
          selectedWallet={selectedWallet}
          onWalletChange={setSelectedWallet}
        />
        <BalanceDisplay
          total={currentBalance.total}
          change={currentBalance.change}
          percentage={currentBalance.percentage}
          isPositive={currentBalance.isPositive}
        />
        <ActionButtons />
        <Button
          onPress={logout}
          className="mt-4">
          <Text>Logout</Text>
        </Button>
      </View>
    </View>
  );
}
