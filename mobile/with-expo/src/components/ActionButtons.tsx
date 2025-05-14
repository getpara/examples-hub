import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from "@/components/icons";
import { useRouter } from "expo-router";
import { toast } from "sonner-native";

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
      accessibilityLabel={label}>
      <View className="w-14 h-14 bg-card border border-border rounded-lg items-center justify-center">{icon}</View>
      <Text className="text-sm font-medium text-foreground">{label}</Text>
    </Pressable>
  );
}

export function ActionButtons() {
  const router = useRouter();

  const handleReceive = () => {
    toast.info("Receive not implemented yet", {
      description: "This feature is not yet implemented.",
    });
  };

  const handleSend = () => {
    router.navigate("/home/transaction/token");
  };

  const handleSwap = () => {
    toast.info("Swap not implemented yet", {
      description: "This feature is not yet implemented.",
    });
  };

  return (
    <View className="flex-row justify-center w-full gap-8 pt-2">
      <ActionButton
        icon={
          <ArrowUpFromLine
            size={24}
            className="text-primary"
          />
        }
        label="Send"
        onPress={handleSend}
      />
      <ActionButton
        icon={
          <ArrowDownToLine
            size={24}
            className="text-primary"
          />
        }
        label="Receive"
        onPress={handleReceive}
      />
      <ActionButton
        icon={
          <ArrowLeftRight
            size={24}
            className="text-primary"
          />
        }
        label="Swap"
        onPress={handleSwap}
      />
    </View>
  );
}
