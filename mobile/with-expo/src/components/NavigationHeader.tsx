import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { Pressable, View } from "react-native";
import { ArrowLeft } from "@/components/icons/ArrowLeft";

export function Header({ navigation }: NativeStackHeaderProps) {
  return (
    <View className="bg-background pt-4 px-6">
      <View className="flex-row items-center">
        <Pressable
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <ArrowLeft
            size={24}
            className="text-muted-foreground"
          />
        </Pressable>
      </View>
    </View>
  );
}
