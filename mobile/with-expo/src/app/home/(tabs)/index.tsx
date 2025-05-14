import React, { useRef } from "react";
import { View, TouchableOpacity } from "react-native";
import ReanimatedDrawerLayout, {
  DrawerType,
  DrawerPosition,
  DrawerLayoutMethods,
} from "react-native-gesture-handler/ReanimatedDrawerLayout";
import { useRouter } from "expo-router";
import { usePara } from "@/providers/para/usePara";
import { BalanceDisplay } from "~/components/BalanceDisplay";
import { ActionButtons } from "~/components/ActionButtons";
import { Card, CardContent } from "@/components/ui/card";
import { Menu } from "@/components/icons/Menu";
import { DrawerContent } from "@/components/DrawerContent";

export default function HomeScreen() {
  const drawerRef = useRef<DrawerLayoutMethods>(null);
  const router = useRouter();
  const { logout } = usePara();

  const handleLogout = async () => {
    drawerRef.current?.closeDrawer();
    await logout();
  };

  return (
    <ReanimatedDrawerLayout
      ref={drawerRef}
      drawerWidth={250}
      drawerPosition={DrawerPosition.RIGHT}
      drawerType={DrawerType.FRONT}
      renderNavigationView={() => <DrawerContent onLogout={handleLogout} />}
      overlayColor="rgba(0, 0, 0, 0.5)">
      <View className="flex-1 bg-background">
        <View className="h-14 flex-row items-center justify-between px-6 border-b border-border bg-white">
          <View />
          <TouchableOpacity
            className="p-2"
            onPress={() => drawerRef.current?.openDrawer()}>
            <Menu className="text-foreground" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 px-6 pt-6">
          <Card className="w-full bg-card border border-border shadow-none">
            <CardContent className="py-6 gap-8">
              <BalanceDisplay
                total={100}
                change={0.1}
                percentage={0.1}
                isPositive={true}
              />
              <ActionButtons />
            </CardContent>
          </Card>
        </View>
      </View>
    </ReanimatedDrawerLayout>
  );
}
