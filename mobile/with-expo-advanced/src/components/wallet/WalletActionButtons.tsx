import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '~/components/ui/text';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
} from '@/components/icons';

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

function ActionButton({ icon, label, onPress }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="items-center gap-2"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View className="w-14 h-14 bg-card border border-border rounded-lg items-center justify-center">
        {icon}
      </View>
      <Text className="text-sm font-medium text-foreground">{label}</Text>
    </Pressable>
  );
}

interface WalletActionButtonsProps {
  onSend: () => void;
  onReceive: () => void;
  onSwap: () => void;
}

export function WalletActionButtons({
  onSend,
  onReceive,
  onSwap,
}: WalletActionButtonsProps) {
  return (
    <View className="flex-row justify-center w-full gap-8 pt-2">
      <ActionButton
        icon={<ArrowUpFromLine size={24} className="text-primary" />}
        label="Send"
        onPress={onSend}
      />
      <ActionButton
        icon={<ArrowDownToLine size={24} className="text-primary" />}
        label="Receive"
        onPress={onReceive}
      />
      <ActionButton
        icon={<ArrowLeftRight size={24} className="text-primary" />}
        label="Swap"
        onPress={onSwap}
      />
    </View>
  );
}
