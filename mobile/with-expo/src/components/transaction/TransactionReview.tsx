import React from 'react';
import { View, ScrollView, ImageSourcePropType } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { WalletType } from '@getpara/react-native-wallet';
import { formatUsdValue, formatAddress } from '@/utils/formattingUtils';
import { SupportedWalletType } from '@/types';

export interface TransactionReviewProps {
  networkType: SupportedWalletType;
  tokenName: string;
  tokenTicker: string;
  tokenDecimals: number;
  tokenLogo?: ImageSourcePropType;
  senderAddress: string;
  senderWalletName?: string;
  recipientAddress: string;
  recipientName?: string;
  amount: string;
  amountUsd: number | null;

  // EVM specific props
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;

  // Solana specific props
  computeUnits?: number;
  priorityFee?: number;

  // Common fee details
  feeInCrypto: string;
  feeInUsd: number | null;

  // Total amount
  totalInCrypto: string;
  totalInUsd: number | null;

  // Network details
  networkName: string;
  chainId?: string | number;

  // Optional explanation or warning
  warningMessage?: string;
}

export function TransactionReview({
  networkType,
  tokenName,
  tokenTicker,
  tokenLogo: _tokenLogo,
  senderAddress,
  senderWalletName,
  recipientAddress,
  recipientName,
  amount,
  amountUsd,
  gasLimit,
  gasPrice,
  maxFeePerGas,
  maxPriorityFeePerGas,
  computeUnits,
  priorityFee,
  feeInCrypto,
  feeInUsd,
  totalInCrypto,
  totalInUsd,
  networkName,
  chainId,
  warningMessage,
}: TransactionReviewProps) {
  // Helper function to render address with name
  const renderAddress = (address: string, name?: string) => (
    <View>
      {name && <Text className="text-sm font-medium mb-1">{name}</Text>}
      <Text className="text-sm font-medium text-foreground">
        {formatAddress(address, networkType)}
      </Text>
      <Text className="text-xs text-muted-foreground mt-1">{address}</Text>
    </View>
  );

  // Helper function to render amount row
  const renderAmountRow = (
    label: string,
    amount: string,
    usdValue: number | null,
    isBold: boolean = false
  ) => (
    <View className="flex-row justify-between items-center my-2">
      <Text
        className={`text-sm ${isBold ? 'font-bold' : 'font-medium'} text-foreground`}
      >
        {label}
      </Text>
      <View className="items-end">
        <Text
          className={`text-sm ${isBold ? 'font-bold' : 'font-medium'} text-foreground`}
        >
          {amount}
        </Text>
        {usdValue !== null && (
          <Text className="text-xs text-muted-foreground">
            {formatUsdValue(usdValue)}
          </Text>
        )}
      </View>
    </View>
  );

  // Render network specific fee details
  const renderNetworkFeeDetails = () => {
    if (networkType === WalletType.EVM) {
      return (
        <Card className="border border-border mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ethereum Fee Details</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="space-y-2">
              {gasLimit && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">
                    Gas Limit
                  </Text>
                  <Text className="text-sm">{gasLimit} units</Text>
                </View>
              )}

              {gasPrice && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">
                    Gas Price
                  </Text>
                  <Text className="text-sm">{gasPrice} Gwei</Text>
                </View>
              )}

              {maxFeePerGas && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">
                    Max Fee Per Gas
                  </Text>
                  <Text className="text-sm">{maxFeePerGas} Gwei</Text>
                </View>
              )}

              {maxPriorityFeePerGas && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">
                    Priority Fee
                  </Text>
                  <Text className="text-sm">{maxPriorityFeePerGas} Gwei</Text>
                </View>
              )}

              <View className="flex-row justify-between pt-2 border-t border-border">
                <Text className="text-sm font-medium">Total Fee</Text>
                <View className="items-end">
                  <Text className="text-sm font-medium">{feeInCrypto} ETH</Text>
                  {feeInUsd !== null && (
                    <Text className="text-xs text-muted-foreground">
                      {formatUsdValue(feeInUsd)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
      );
    } else if (networkType === WalletType.SOLANA) {
      return (
        <Card className="border border-border mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Solana Fee Details</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="space-y-2">
              {computeUnits !== undefined && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">
                    Compute Units
                  </Text>
                  <Text className="text-sm">{computeUnits} units</Text>
                </View>
              )}

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">
                  Network Fee
                </Text>
                <Text className="text-sm">0.000005 SOL</Text>
              </View>

              {priorityFee !== undefined && priorityFee > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">
                    Priority Fee
                  </Text>
                  <Text className="text-sm">
                    {(priorityFee / 1_000_000_000).toFixed(9)} SOL
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between pt-2 border-t border-border">
                <Text className="text-sm font-medium">Total Fee</Text>
                <View className="items-end">
                  <Text className="text-sm font-medium">{feeInCrypto} SOL</Text>
                  {feeInUsd !== null && (
                    <Text className="text-xs text-muted-foreground">
                      {formatUsdValue(feeInUsd)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="mb-6 pt-2">
        <Text className="text-2xl font-bold text-foreground mb-1">
          Review Transaction
        </Text>
        <Text className="text-base text-muted-foreground">
          Please review the transaction details before confirming
        </Text>
      </View>

      <Card className="border border-border mb-4">
        <CardContent className="p-4">
          <View className="space-y-4">
            <View>
              <Text className="text-sm text-muted-foreground mb-1">From</Text>
              {renderAddress(senderAddress, senderWalletName)}
            </View>

            <Separator />

            <View>
              <Text className="text-sm text-muted-foreground mb-1">To</Text>
              {renderAddress(recipientAddress, recipientName)}
            </View>
          </View>
        </CardContent>
      </Card>

      <Card className="border border-border mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Network & Token Details</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">Network</Text>
              <Text className="text-sm">{networkName}</Text>
            </View>
            {chainId && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Chain ID</Text>
                <Text className="text-sm">{chainId}</Text>
              </View>
            )}
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">Token</Text>
              <Text className="text-sm">
                {tokenName} ({tokenTicker})
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>

      <Card className="border border-border mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Amount & Fees</CardTitle>
        </CardHeader>
        <CardContent>
          {renderAmountRow('Amount', `${amount} ${tokenTicker}`, amountUsd)}
          {renderAmountRow(
            'Network Fee',
            `${feeInCrypto} ${networkType === WalletType.EVM ? 'ETH' : 'SOL'}`,
            feeInUsd
          )}
          <Separator className="my-2" />
          {renderAmountRow(
            'Total',
            `${totalInCrypto} ${tokenTicker}`,
            totalInUsd,
            true
          )}
        </CardContent>
      </Card>

      {renderNetworkFeeDetails()}

      {warningMessage && (
        <View className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-6">
          <Text className="text-sm text-yellow-800">{warningMessage}</Text>
        </View>
      )}

      <View className="h-20" />
    </ScrollView>
  );
}
