import React from "react";
import { View, FlatList, ActivityIndicator, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Search, SlidersHorizontal, RefreshCcw } from "@/components/icons";
import { WalletType } from "@getpara/react-native-wallet";
import { TransactionListItem, TransactionData } from "./TransactionListItem";
import { SortOption, FilterNetwork, FilterType } from "@/utils/transactionListUtils";

interface SortOptionConfig {
  label: string;
  value: SortOption;
}

export interface TransactionListProps {
  transactions: TransactionData[];
  isLoading: boolean;
  onTransactionPress: (transaction: TransactionData) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  title?: string;
  showFilters?: boolean;
  // Filter state
  sortOption: SortOption;
  filterNetwork: FilterNetwork;
  filterType: FilterType;
  searchQuery: string;
  showFilterOptions: boolean;
  sortOptions: SortOptionConfig[];
  hasActiveFilters: boolean;
  // Filter actions
  onSortChange: (option: SortOption) => void;
  onNetworkFilterChange: (network: FilterNetwork) => void;
  onTypeFilterChange: (type: FilterType) => void;
  onSearchChange: (query: string) => void;
  onToggleFilters: () => void;
  onResetFilters: () => void;
  // Utilities
  getEmptyMessage: () => string;
  getEmptyDescription: () => string;
}

export function TransactionList({
  transactions,
  isLoading,
  onTransactionPress,
  onRefresh,
  isRefreshing = false,
  title = "Transaction History",
  showFilters = true,
  sortOption,
  filterNetwork,
  filterType,
  searchQuery,
  showFilterOptions,
  sortOptions,
  hasActiveFilters,
  onSortChange,
  onNetworkFilterChange,
  onTypeFilterChange,
  onSearchChange,
  onToggleFilters,
  onResetFilters,
  getEmptyMessage,
  getEmptyDescription,
}: TransactionListProps) {

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-10">
          <ActivityIndicator
            size="large"
            color="#6366f1"
          />
          <Text className="text-center text-muted-foreground mt-4">Loading transactions...</Text>
        </View>
      );
    }

    if (hasActiveFilters) {
      return (
        <View className="flex-1 items-center justify-center py-10">
          <Text className="text-center text-muted-foreground">{getEmptyMessage()}</Text>
          <Button
            variant="outline"
            className="mt-4"
            onPress={onResetFilters}>
            <Text>Reset Filters</Text>
          </Button>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-10">
        <Text className="text-center text-lg font-medium text-foreground mb-2">{getEmptyMessage()}</Text>
        <Text className="text-center text-muted-foreground mb-6">{getEmptyDescription()}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <View className="mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-medium text-foreground">{title}</Text>

          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onPress={onRefresh}
              accessibilityLabel="Refresh transactions">
              <RefreshCcw className="text-muted-foreground" />
            </Button>
          )}
        </View>
      </View>

      {showFilters && (
        <View className="mb-4">
          <View className="relative">
            <Input
              placeholder="Search transactions"
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

          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-sm text-muted-foreground">
              {transactions.length}{" "}
              {transactions.length === 1 ? "transaction" : "transactions"}
            </Text>

            <Button
              variant="ghost"
              size="sm"
              onPress={onToggleFilters}
              className="h-8 px-2">
              <SlidersHorizontal
                size={18}
                className="text-muted-foreground mr-2"
              />
              <Text className="text-muted-foreground">Filters</Text>
            </Button>
          </View>

          {showFilterOptions && (
            <View className="mt-3 p-3 border border-border rounded-md bg-card">
              <View className="mb-3">
                <Text className="text-sm font-medium text-foreground mb-2">Network</Text>
                <Tabs
                  value={filterNetwork}
                  onValueChange={(value) => onNetworkFilterChange(value as FilterNetwork)}
                  className="w-full">
                  <TabsList className="w-full h-9 bg-muted">
                    <TabsTrigger
                      value="all"
                      className="flex-1 h-7">
                      <Text>All</Text>
                    </TabsTrigger>
                    <TabsTrigger
                      value={WalletType.EVM}
                      className="flex-1 h-7">
                      <Text>Ethereum</Text>
                    </TabsTrigger>
                    <TabsTrigger
                      value={WalletType.SOLANA}
                      className="flex-1 h-7">
                      <Text>Solana</Text>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </View>

              <View className="mb-3">
                <Text className="text-sm font-medium text-foreground mb-2">Type</Text>
                <Tabs
                  value={filterType}
                  onValueChange={(value) => onTypeFilterChange(value as FilterType)}
                  className="w-full">
                  <TabsList className="w-full h-9 bg-muted">
                    <TabsTrigger
                      value="all"
                      className="flex-1 h-7">
                      <Text>All</Text>
                    </TabsTrigger>
                    <TabsTrigger
                      value="send"
                      className="flex-1 h-7">
                      <Text>Send</Text>
                    </TabsTrigger>
                    <TabsTrigger
                      value="receive"
                      className="flex-1 h-7">
                      <Text>Receive</Text>
                    </TabsTrigger>
                    <TabsTrigger
                      value="swap"
                      className="flex-1 h-7">
                      <Text>Swap</Text>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Sort</Text>
                <View className="space-y-2">
                  {sortOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => onSortChange(option.value)}
                      className={`flex-row items-center justify-between p-3 rounded-md ${
                        sortOption === option.value
                          ? "bg-primary/10 border border-primary"
                          : "bg-background border border-border"
                      }`}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: sortOption === option.value }}>
                      <Text
                        className={`${sortOption === option.value ? "text-primary font-medium" : "text-foreground"}`}>
                        {option.label}
                      </Text>
                      {sortOption === option.value && (
                        <View className="w-4 h-4 rounded-full bg-primary items-center justify-center">
                          <View className="w-2 h-2 rounded-full bg-white" />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>

              <Separator className="my-3" />

              <Button
                variant="outline"
                className="w-full"
                onPress={onResetFilters}>
                <Text>Reset Filters</Text>
              </Button>
            </View>
          )}
        </View>
      )}

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionListItem
            transaction={item}
            onPress={onTransactionPress}
          />
        )}
        ListEmptyComponent={renderEmptyState()}
        onRefresh={onRefresh}
        refreshing={isRefreshing}
        contentContainerStyle={transactions.length === 0 ? { flexGrow: 1 } : {}}
      />
    </View>
  );
}
