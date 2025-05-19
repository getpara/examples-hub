import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WalletType } from "@getpara/react-native-wallet";

import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { AmountField } from "@/components/transaction/AmountField";
import { RecipientField } from "@/components/transaction/ReceipientField";
import { useBalances } from "@/hooks/useBalances";
import { usePrices } from "@/hooks/usePrices";
import { formatTokenAmount } from "@/utils/formattingUtils";

export default function TransactionCreationScreen() {
  const router = useRouter();
  const { networkType } = useLocalSearchParams<{ networkType: string }>();
  const net = (networkType as WalletType) || WalletType.EVM;
  const { totalEthBalance, totalSolBalance } = useBalances();
  const { ethPrice, solPrice } = usePrices();

  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isAmountValid, setIsAmountValid] = useState(false);
  const [isRecipientValid, setIsRecipientValid] = useState(false);
  const [usdValue, setUsdValue] = useState<number | null>(null);

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

  const handleContinue = () => {
    if (!isAmountValid || !isRecipientValid) return;
    router.navigate({
      pathname: "/home/transaction/status",
      params: {
        networkType: net,
        to: recipient,
        amount,
        usdValue: usdValue ? usdValue.toString() : "",
      },
    });
  };

  return (
    <View className="flex-1 bg-background px-6 pt-6">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-foreground">Send {ticker}</Text>
      </View>
      <RecipientField
        value={recipient}
        onChange={setRecipient}
        networkType={net}
        onValidChange={setIsRecipientValid}
      />
      <AmountField
        value={amount}
        onChange={setAmount}
        tokenTicker={ticker}
        tokenDecimals={decimals}
        availableBalance={availableBalance}
        availableBalanceUsd={availableUsd}
        usdPrice={net === WalletType.EVM ? ethPrice : solPrice}
        networkType={net}
        onValidChange={setIsAmountValid}
        onUsdValueChange={setUsdValue}
      />
      <Button onPress={handleContinue} disabled={!isAmountValid || !isRecipientValid}>
        <Text className="text-primary-foreground font-medium">Review</Text>
      </Button>
    </View>
  );
}
