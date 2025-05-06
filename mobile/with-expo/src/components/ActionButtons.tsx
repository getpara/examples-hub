import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from "@/components/icons";
import { useRouter } from "expo-router";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

function ActionButton({ icon, label, onPress }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="items-center gap-3">
      <View className="w-14 h-14 bg-muted rounded-lg items-center justify-center">{icon}</View>
      <Text className="text-foreground">{label}</Text>
    </Pressable>
  );
}

export function ActionButtons() {
  const router = useRouter();

  const handleReceive = () => {
    // Handle receive action
  };

  const handleSend = () => {
    // Handle send action
  };

  const handleSwap = () => {
    // Handle swap action
  };

  return (
    <View className="flex-row justify-around w-full px-8 py-6">
      <ActionButton
        icon={
          <ArrowDownToLine
            size={24}
            className="text-foreground"
          />
        }
        label="Receive"
        onPress={handleReceive}
      />
      <ActionButton
        icon={
          <ArrowUpFromLine
            size={24}
            className="text-foreground"
          />
        }
        label="Send"
        onPress={handleSend}
      />
      <ActionButton
        icon={
          <ArrowLeftRight
            size={24}
            className="text-foreground"
          />
        }
        label="Swap"
        onPress={handleSwap}
      />
    </View>
  );
}
