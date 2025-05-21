import React from "react";
import { View, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { WalletType } from "@getpara/react-native-wallet";
import { AlertCircle, XCircle, AlertTriangle, Info, RefreshCcw } from "@/components/icons";

export type ErrorCategory =
  // Common errors
  | "insufficient_funds"
  | "user_rejected"
  | "timeout"
  | "network_error"
  // EVM specific errors
  | "gas_underpriced"
  | "gas_limit_exceeded"
  | "nonce_error"
  | "contract_error"
  | "execution_reverted"
  // Solana specific errors
  | "instruction_error"
  | "blockhash_expired"
  | "account_not_found"
  | "insufficient_priority_fee"
  // General error
  | "unknown";

export interface TransactionError {
  category: ErrorCategory;
  message: string;
  code?: string | number;
  details?: string;
}

export interface ErrorDisplayProps {
  error: TransactionError;
  networkType: WalletType;
  txHash?: string;
  onRetry?: () => void;
  onViewExplorer?: () => void;
}

export function ErrorDisplay({ error, networkType, txHash, onRetry, onViewExplorer }: ErrorDisplayProps) {
  // Get network name
  const networkName = networkType === WalletType.EVM ? "Ethereum" : "Solana";

  // Get error title based on category
  const getErrorTitle = () => {
    switch (error.category) {
      case "insufficient_funds":
        return "Insufficient Funds";
      case "user_rejected":
        return "Transaction Rejected";
      case "timeout":
        return "Transaction Timeout";
      case "network_error":
        return "Network Error";
      case "gas_underpriced":
        return "Gas Price Too Low";
      case "gas_limit_exceeded":
        return "Gas Limit Exceeded";
      case "nonce_error":
        return "Nonce Error";
      case "contract_error":
      case "execution_reverted":
        return "Contract Execution Error";
      case "instruction_error":
        return "Instruction Error";
      case "blockhash_expired":
        return "Transaction Expired";
      case "account_not_found":
        return "Account Not Found";
      case "insufficient_priority_fee":
        return "Insufficient Priority Fee";
      default:
        return "Transaction Failed";
    }
  };

  // Get error description based on category and network type
  const getErrorDescription = () => {
    switch (error.category) {
      case "insufficient_funds":
        return networkType === WalletType.EVM
          ? "Your wallet does not have enough funds to cover the transaction amount and gas fees."
          : "Your wallet does not have enough SOL to cover the transaction amount and fees.";

      case "user_rejected":
        return "You rejected the transaction request. No funds were transferred.";

      case "timeout":
        return "The transaction took too long to confirm and has timed out. This doesn't necessarily mean it failed - it might still be pending on the network.";

      case "network_error":
        return `There was an issue connecting to the ${networkName} network. Please check your internet connection and try again.`;

      case "gas_underpriced":
        return "The gas price was set too low for the current network conditions. Try again with a higher gas price.";

      case "gas_limit_exceeded":
        return "The transaction exceeded the gas limit. This usually happens when the contract execution requires more gas than the limit you set.";

      case "nonce_error":
        return "Transaction nonce error. There may be another pending transaction from your address.";

      case "contract_error":
      case "execution_reverted":
        return "The smart contract execution reverted. This usually means the contract rejected the transaction due to its internal conditions.";

      case "instruction_error":
        return "A Solana instruction within the transaction failed to execute properly.";

      case "blockhash_expired":
        return "The recent blockhash used in this transaction has expired. Solana transactions have a short validity window.";

      case "account_not_found":
        return "One of the accounts referenced in the transaction was not found on the Solana blockchain.";

      case "insufficient_priority_fee":
        return "The priority fee was too low. Increase the priority fee to improve chances of faster confirmation.";

      default:
        return "An unknown error occurred while processing your transaction. Please try again or contact support if the issue persists.";
    }
  };

  // Get remediation steps based on error category
  const getRemediationSteps = () => {
    switch (error.category) {
      case "insufficient_funds":
        return [
          networkType === WalletType.EVM
            ? "Ensure you have enough ETH to cover both the transaction amount and gas fees"
            : "Ensure you have enough SOL to cover both the transaction amount and network fees",
          "Try sending a smaller amount",
          "Add funds to your wallet and try again",
        ];

      case "user_rejected":
        return ["You can retry the transaction if you want to proceed"];

      case "timeout":
        return [
          "Check the transaction status in the blockchain explorer",
          "If the transaction is still pending, wait for it to complete",
          "If it doesn't appear in the explorer, you can safely retry",
        ];

      case "network_error":
        return [
          "Check your internet connection",
          "The network might be congested, try again later",
          "If the problem persists, try switching to a different network provider",
        ];

      case "gas_underpriced":
        return [
          "Retry the transaction with a higher gas price",
          "Select a faster fee option in the transaction settings",
          "Check current gas prices on a gas tracker website before retrying",
        ];

      case "gas_limit_exceeded":
        return [
          "Increase the gas limit for your transaction",
          "Simplify the transaction if possible",
          "Contact the dApp or contract developer if the issue persists",
        ];

      case "nonce_error":
        return [
          "Wait for any pending transactions to confirm first",
          "Reset your transaction queue in your wallet settings",
          "Try again with the correct nonce value",
        ];

      case "contract_error":
      case "execution_reverted":
        return [
          "Check if you're meeting all requirements for the contract operation",
          "Review any error messages from the contract for specific issues",
          "Contact the dApp or contract developer for assistance",
        ];

      case "instruction_error":
        return [
          "Check the specific instruction error code for details",
          "Verify all accounts and data being passed to the program",
          "Try simplifying the transaction if it's complex",
        ];

      case "blockhash_expired":
        return [
          "Simply retry the transaction to get a fresh blockhash",
          "Solana transactions have a short validity window (about 2 minutes)",
        ];

      case "account_not_found":
        return [
          "Verify that all account addresses in the transaction are correct",
          "The account may need to be created first before using it",
        ];

      case "insufficient_priority_fee":
        return [
          "Retry the transaction with a higher priority fee",
          "Network congestion might require higher fees for timely processing",
        ];

      default:
        return [
          "Try the transaction again",
          "If the problem persists, try with different parameters",
          "Contact support if you continue to experience issues",
        ];
    }
  };

  // Icon based on error category
  const getErrorIcon = () => {
    switch (error.category) {
      case "user_rejected":
        return (
          <Info
            size={24}
            className="text-primary"
          />
        );
      case "timeout":
      case "network_error":
        return (
          <AlertTriangle
            size={24}
            className="text-yellow-600"
          />
        );
      default:
        return (
          <XCircle
            size={24}
            className="text-destructive"
          />
        );
    }
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}>
      <View className="items-center mb-6">
        <View className="w-16 h-16 rounded-full bg-destructive/10 items-center justify-center mb-4">
          <XCircle
            size={40}
            className="text-destructive"
          />
        </View>
        <Text className="text-xl font-bold text-foreground">{getErrorTitle()}</Text>
        <Text className="text-base text-muted-foreground text-center mt-2 px-6">{getErrorDescription()}</Text>
      </View>

      <Card className="border border-border mb-4">
        <CardContent className="p-4">
          <View className="flex-row items-start mb-4">
            {getErrorIcon()}
            <View className="ml-3 flex-1">
              <Text className="text-base font-medium text-foreground">Error Details</Text>
              <Text className="text-sm text-muted-foreground mt-1">{error.message}</Text>
              {error.code && <Text className="text-sm text-muted-foreground mt-1">Code: {error.code}</Text>}
              {error.details && <Text className="text-sm text-muted-foreground mt-1">{error.details}</Text>}
            </View>
          </View>

          {txHash && (
            <View className="py-3 border-t border-border">
              <Text className="text-sm font-medium text-foreground mb-1">Transaction Hash</Text>
              <Text className="text-sm text-muted-foreground break-all">{txHash}</Text>
            </View>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border mb-6">
        <CardContent className="p-4">
          <Text className="text-base font-medium text-foreground mb-3">What Can You Do?</Text>
          <View className="space-y-2">
            {getRemediationSteps().map((step, index) => (
              <View
                key={index}
                className="flex-row items-start">
                <AlertCircle
                  size={16}
                  className="text-primary mt-0.5 mr-2"
                />
                <Text className="text-sm text-foreground flex-1">{step}</Text>
              </View>
            ))}
          </View>
        </CardContent>
      </Card>

      <View className="flex-row gap-x-4 mb-10">
        {onRetry && (
          <Button
            className="flex-1"
            onPress={onRetry}
            accessibilityLabel="Retry transaction">
            <RefreshCcw
              size={18}
              className="text-primary-foreground mr-2"
            />
            <Text className="text-primary-foreground font-medium">Retry</Text>
          </Button>
        )}

        {onViewExplorer && txHash && (
          <Button
            variant="outline"
            className="flex-1"
            onPress={onViewExplorer}
            accessibilityLabel="View in blockchain explorer">
            <Text className="text-foreground font-medium">View in Explorer</Text>
          </Button>
        )}
      </View>
    </ScrollView>
  );
}
