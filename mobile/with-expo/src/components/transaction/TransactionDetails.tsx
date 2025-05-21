import React from "react";
import { View, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { WalletType } from "@getpara/react-native-wallet";
import { formatUsdValue, formatAddress } from "@/utils/formattingUtils";
import { formatDuration, formatDateTime } from "@/utils/timeUtils";
import { TransactionStatus } from "./StatusIndicator";
import { SupportedWalletType } from "@/types";

export interface TransactionDetailsProps {
  txHash: string;
  amount: string;
  tokenTicker: string;
  tokenName: string;
  recipientAddress: string;
  recipientName?: string;
  senderAddress: string;
  senderName?: string;
  amountUsd: number | null;
  networkType: SupportedWalletType;
  networkName: string;
  status: TransactionStatus;
  timestamp: number;
  gasLimit?: string;
  gasUsed?: string;
  gasPrice?: string;
  nonce?: number;
  blockNumber?: number;
  computeUnits?: number;
  computeUnitsUsed?: number;
  slot?: number;
  signature?: string;
  feeInCrypto: string;
  feeInUsd: number | null;
  confirmations?: number;
  estimatedTime?: number;
  elapsedTime?: number;
}

export function TransactionDetails({
  txHash,
  amount,
  tokenTicker,
  tokenName,
  recipientAddress,
  recipientName,
  senderAddress,
  senderName,
  amountUsd,
  networkType,
  networkName,
  status,
  timestamp,
  gasLimit,
  gasUsed,
  gasPrice,
  nonce,
  blockNumber,
  computeUnits,
  computeUnitsUsed,
  slot,
  signature,
  feeInCrypto,
  feeInUsd,
  confirmations,
  estimatedTime,
  elapsedTime,
}: TransactionDetailsProps) {
  const renderAddress = (address: string, name?: string) => (
    <View>
      {name && <Text className="text-sm font-medium mb-1">{name}</Text>}
      <Text className="text-sm font-medium text-foreground">{formatAddress(address, networkType)}</Text>
      <Text className="text-xs text-muted-foreground mt-1">{address}</Text>
    </View>
  );

  const renderDetailRow = (label: string, value: React.ReactNode) => (
    <View className="flex-row justify-between py-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      {typeof value === "string" ? <Text className="text-sm text-right text-foreground">{value}</Text> : value}
    </View>
  );

  const renderEvmDetails = () => (
    <View>
      {nonce !== undefined && renderDetailRow("Nonce", nonce.toString())}
      {gasLimit && renderDetailRow("Gas Limit", gasLimit)}
      {gasUsed && renderDetailRow("Gas Used", gasUsed)}
      {gasPrice && renderDetailRow("Gas Price", `${gasPrice} Gwei`)}
      {blockNumber && renderDetailRow("Block Number", blockNumber.toString())}
      {confirmations !== undefined && renderDetailRow("Confirmations", confirmations.toString())}
    </View>
  );

  const renderSolanaDetails = () => (
    <View>
      {computeUnits && renderDetailRow("Compute Budget", computeUnits.toString())}
      {computeUnitsUsed && renderDetailRow("Compute Units Used", computeUnitsUsed.toString())}
      {slot && renderDetailRow("Slot", slot.toString())}
      {confirmations !== undefined && renderDetailRow("Confirmations", confirmations.toString())}
    </View>
  );

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}>
      <Card className="border border-border mb-4">
        <CardContent className="p-4">
          <View className="mb-3">
            <Text className="text-base font-medium mb-1">Amount</Text>
            <View>
              <Text className="text-xl font-bold text-foreground">
                {amount} {tokenTicker}
              </Text>
              {amountUsd !== null && <Text className="text-sm text-muted-foreground">{formatUsdValue(amountUsd)}</Text>}
            </View>
          </View>

          <Separator className="my-3" />

          <View className="space-y-4">
            <View>
              <Text className="text-sm text-muted-foreground mb-1">From</Text>
              {renderAddress(senderAddress, senderName)}
            </View>

            <View>
              <Text className="text-sm text-muted-foreground mb-1">To</Text>
              {renderAddress(recipientAddress, recipientName)}
            </View>
          </View>
        </CardContent>
      </Card>

      <Card className="border border-border mb-4">
        <CardContent className="p-4">
          <Text className="text-base font-medium mb-3">Transaction Details</Text>

          {renderDetailRow(
            "Status",
            <Text
              className={`text-sm font-medium ${
                status === "confirmed" ? "text-green-600" : status === "failed" ? "text-destructive" : "text-yellow-600"
              }`}>
              {status === "confirmed" ? "Confirmed" : status === "failed" ? "Failed" : "Pending"}
            </Text>
          )}

          {renderDetailRow("Network", networkName)}
          {renderDetailRow("Token", `${tokenName} (${tokenTicker})`)}
          {renderDetailRow(
            "Transaction Fee",
            <View className="items-end">
              <Text className="text-sm text-foreground">
                {feeInCrypto} {networkType === WalletType.EVM ? "ETH" : "SOL"}
              </Text>
              {feeInUsd !== null && <Text className="text-xs text-muted-foreground">{formatUsdValue(feeInUsd)}</Text>}
            </View>
          )}

          {renderDetailRow(
            "Transaction Hash",
            <Text
              className="text-sm text-right text-foreground max-w-[180px]"
              numberOfLines={1}
              ellipsizeMode="middle">
              {txHash}
            </Text>
          )}

          {renderDetailRow("Date", formatDateTime(timestamp))}

          {status === "pending" &&
            estimatedTime !== undefined &&
            renderDetailRow("Estimated Time", formatDuration(estimatedTime))}
          {elapsedTime !== undefined && renderDetailRow("Elapsed Time", formatDuration(elapsedTime))}

          <Separator className="my-3" />

          {networkType === WalletType.EVM ? renderEvmDetails() : renderSolanaDetails()}
        </CardContent>
      </Card>

      <View className="h-20" />
    </ScrollView>
  );
}
