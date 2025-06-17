import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

interface DrawerContentProps {
  onLogout: () => Promise<void> | void;
}

export function AppDrawer({ onLogout }: DrawerContentProps) {
  return (
    <View className="flex-1 pt-5 px-4 justify-between bg-background">
      <View>
        <View className="mb-5">
          <Text className="text-2xl font-figtree-bold">Menu</Text>
        </View>
        <View>
          <Text className="text-gray-500 mb-2 font-figtree-bold text-md">
            Expo Demo App
          </Text>
          <Text className="text-gray-500">
            {' '}
            A demo app showing Para SDK usage
          </Text>
        </View>
      </View>

      <Button
        className="bg-primary p-4 rounded-lg mb-8 flex-row items-center justify-center"
        onPress={onLogout}
      >
        <Text className="text-white font-bold">Logout</Text>
      </Button>
    </View>
  );
}
