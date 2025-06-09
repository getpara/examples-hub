import React from "react";
import { View, ScrollView, Image, ActivityIndicator } from "react-native";
import { Text } from "~/components/ui/text";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TokenItem } from "@/components/transaction/TokenItem";
import { WalletType } from "@getpara/react-native-wallet";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react-native";
import { SUPPORTED_WALLET_TYPES, SupportedWalletType } from "@/types";
import { TokenData, getNetworkName, getNetworkIcon } from "@/utils/tokenUtils";


interface TokenListProps {
  isLoading: boolean;
  onSelectToken: (tokenId: string) => void;
  selectedTokenId?: string;
  activeTab: "all" | SupportedWalletType;
  searchQuery: string;
  filteredTokens: TokenData[];
  groupedTokens: Record<SupportedWalletType, TokenData[]>;
  hasResults: boolean;
  emptyMessage: string;
  onTabChange: (value: "all" | SupportedWalletType) => void;
  onSearchChange: (value: string) => void;
}

export function TokenList({
  isLoading,
  onSelectToken,
  selectedTokenId,
  activeTab,
  searchQuery,
  filteredTokens,
  groupedTokens,
  hasResults,
  emptyMessage,
  onTabChange,
  onSearchChange,
}: TokenListProps) {

  const renderTokenGroup = (networkType: SupportedWalletType, tokens: TokenData[]) => {
    if (!tokens.length) return null;

    const networkName = getNetworkName(networkType);
    const networkIcon = getNetworkIcon(networkType);

    return (
      <View
        className="mb-6"
        key={networkType}>
        <View className="flex-row items-center mb-2">
          <Image
            source={networkIcon}
            className="h-5 w-5 mr-2"
            resizeMode="contain"
          />
          <Text className="text-lg font-medium text-foreground">{networkName}</Text>
        </View>

        <View className="space-y-3">
          {tokens.map((token) => (
            <TokenItem
              key={token.id}
              {...token}
              isSelected={selectedTokenId === token.id}
              onSelect={onSelectToken}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <View className="mb-4">
        <View className="relative">
          <Input
            placeholder="Search tokens"
            className="pl-10 pr-4"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          <View className="absolute left-3 top-3">
            <Search
              size={20}
              className="text-muted-foreground"
            />
          </View>
        </View>
      </View>

      <Tabs
        value={activeTab}
        onValueChange={(value) => onTabChange(value as "all" | SupportedWalletType)}
        className="w-full mb-4">
        <TabsList className="w-full h-auto bg-card border border-border p-1 rounded-lg">
          <TabsTrigger
            value="all"
            className="flex-1 rounded-md py-2">
            <Text>All</Text>
          </TabsTrigger>
          <TabsTrigger
            value={WalletType.EVM}
            className="flex-1 rounded-md py-2">
            <Text>Ethereum</Text>
          </TabsTrigger>
          <TabsTrigger
            value={WalletType.SOLANA}
            className="flex-1 rounded-md py-2">
            <Text>Solana</Text>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator
            size="large"
            color="#6366f1"
          />
          <Text className="mt-2 text-center text-muted-foreground">Loading tokens...</Text>
        </View>
      ) : !hasResults ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-center text-muted-foreground">
            {emptyMessage}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}>
          {activeTab === "all" ? (
            <>{SUPPORTED_WALLET_TYPES.map((type) => renderTokenGroup(type, groupedTokens[type]))}</>
          ) : (
            renderTokenGroup(activeTab, groupedTokens[activeTab])
          )}

          <View className="h-20" />
        </ScrollView>
      )}
    </View>
  );
}
