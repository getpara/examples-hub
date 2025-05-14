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
      className="items-center gap-3">
      <View className="w-14 h-14 bg-white border border-border rounded-lg items-center justify-center">{icon}</View>
      <Text className="text-foreground">{label}</Text>
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
    <View className="flex-row justify-center w-full gap-8">
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
