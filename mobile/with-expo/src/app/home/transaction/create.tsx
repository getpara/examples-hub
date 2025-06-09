import React, { useMemo } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WalletType } from "@getpara/react-native-wallet";

import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { AmountField } from "@/components/transaction/AmountField";
import { RecipientField } from "@/components/transaction/ReceipientField";
import { useBalances } from "@/hooks/useBalances";
import { usePrices } from "@/hooks/usePrices";
import { useAmountInput } from "@/hooks/useAmountInput";
import { useRecipientInput } from "@/hooks/useRecipientInput";
import { formatTokenAmount } from "@/utils/formattingUtils";

export default function TransactionCreationScreen() {
  const router = useRouter();
  const { networkType } = useLocalSearchParams<{ networkType: string }>();
  const net = (networkType as WalletType) || WalletType.EVM;
  const { totalEthBalance, totalSolBalance } = useBalances();
  const { ethPrice, solPrice } = usePrices();


  const availableBalance = useMemo(() => {
    if (net === WalletType.EVM) {
      return parseFloat(formatTokenAmount(totalEthBalance, 18));
    }
    return parseFloat(formatTokenAmount(totalSolBalance, 9));
  }, [net, totalEthBalance, totalSolBalance]);

  const availableUsd = useMemo(() => {
    if (net === WalletType.EVM) {
      return ethPrice ? availableBalance * ethPrice : null;
    }
    return solPrice ? availableBalance * solPrice : null;
  }, [net, availableBalance, ethPrice, solPrice]);

  const decimals = net === WalletType.EVM ? 18 : 9;
  const ticker = net === WalletType.EVM ? "ETH" : "SOL";
  const usdPrice = net === WalletType.EVM ? ethPrice : solPrice;

  // Use hooks for form management
  const amountInput = useAmountInput({
    tokenTicker: ticker,
    availableBalance,
    usdPrice,
    networkType: net,
  });

  const recipientInput = useRecipientInput({
    networkType: net,
  });

  const handleContinue = () => {
    if (!amountInput.isValid || !recipientInput.isValid) return;
    router.navigate({
      pathname: "/home/transaction/status",
      params: {
        networkType: net,
        to: recipientInput.address,
        amount: amountInput.amount,
        usdValue: amountInput.numericUsdValue ? amountInput.numericUsdValue.toString() : "",
      },
    });
  };

  return (
    <View className="flex-1 bg-background px-6 pt-6">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-foreground">Send {ticker}</Text>
      </View>
      <RecipientField
        value={recipientInput.address}
        onChange={recipientInput.handleAddressChange}
        networkType={net}
        isValid={recipientInput.isValid}
        errorMessage={recipientInput.errorMessage}
        successMessage={recipientInput.successMessage}
        placeholder={recipientInput.placeholder}
        networkName={recipientInput.networkName}
      />
      <AmountField
        value={amountInput.amount}
        usdValue={amountInput.usdValue}
        isUsdMode={amountInput.isUsdMode}
        onChange={amountInput.handleAmountChange}
        onToggleMode={amountInput.toggleMode}
        onMaxAmount={amountInput.setMaxAmount}
        tokenTicker={ticker}
        availableBalance={availableBalance}
        availableBalanceUsd={availableUsd}
        conversionDisplay={amountInput.conversionDisplay}
        error={amountInput.error}
        isValid={amountInput.isValid}
      />
      <Button onPress={handleContinue} disabled={!amountInput.isValid || !recipientInput.isValid}>
        <Text className="text-primary-foreground font-medium">Review</Text>
      </Button>
    </View>
  );
}
