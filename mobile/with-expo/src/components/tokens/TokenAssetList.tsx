import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '~/components/ui/text';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import {
  TokenAssetListItem,
  TokenAssetListItemProps,
} from '@/components/tokens/TokenAssetListItem';

interface AssetSectionProps {
  assets: Omit<TokenAssetListItemProps, 'onPress'>[];
  isLoading: boolean;
  onAssetPress: (id: string, address?: string) => void;
}

export function TokenAssetList({
  assets,
  isLoading,
  onAssetPress,
}: AssetSectionProps) {
  const [activeTab, setActiveTab] = React.useState('assets');

  return (
    <View className="mt-6">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xl font-medium text-foreground">Your Assets</Text>
      </View>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex-row w-full h-auto p-0 bg-transparent justify-start mb-2">
          <TabsTrigger
            value="assets"
            className="h-10 flex-1 rounded-none bg-transparent shadow-none px-0 mr-4"
          >
            <View
              className={`pb-2 border-b-2 ${activeTab === 'assets' ? 'border-primary' : 'border-transparent'}`}
            >
              <Text
                className={`text-base font-medium ${
                  activeTab === 'assets'
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                Assets
              </Text>
            </View>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="h-10 flex-1 rounded-none bg-transparent shadow-none px-0"
          >
            <View
              className={`pb-2 border-b-2 ${activeTab === 'history' ? 'border-primary' : 'border-transparent'}`}
            >
              <Text
                className={`text-base font-medium ${
                  activeTab === 'history'
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                History
              </Text>
            </View>
          </TabsTrigger>
        </TabsList>

        <View className="w-full h-px bg-border mb-4" />

        <TabsContent value="assets">
          {assets.length === 0 ? (
            <View className="h-40 items-center justify-center">
              <Text className="text-muted-foreground">
                {isLoading ? 'Loading assets...' : 'No assets found'}
              </Text>
              {isLoading && <ActivityIndicator className="mt-2" />}
            </View>
          ) : (
            <ScrollView className="max-h-64">
              {assets.map((asset) => (
                <TokenAssetListItem
                  key={asset.id}
                  {...asset}
                  onPress={onAssetPress}
                />
              ))}
            </ScrollView>
          )}
        </TabsContent>

        <TabsContent value="history">
          <View className="h-40 items-center justify-center">
            <Text className="text-muted-foreground">
              No transaction history available
            </Text>
          </View>
        </TabsContent>
      </Tabs>
    </View>
  );
}
