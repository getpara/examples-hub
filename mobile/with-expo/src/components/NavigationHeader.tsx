import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { View } from "lucide-react-native";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "@/components/icons/ArrowLeft";

export function Header({ navigation }: NativeStackHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-background"
      style={{
        paddingTop: insets.top,
        paddingHorizontal: 16,
      }}>
      <View className="h-14 flex-row items-center">
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
