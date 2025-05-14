import React, { useRef, useEffect } from "react";
import { View, TouchableOpacity, Image, ScrollView } from "react-native";
import ReanimatedDrawerLayout, {
  DrawerType,
  DrawerPosition,
  DrawerLayoutMethods,
} from "react-native-gesture-handler/ReanimatedDrawerLayout";
import { usePara } from "@/providers/para/usePara";
import { useWallet } from "@/providers/wallet/useWallet";
import { BalanceDisplay } from "~/components/BalanceDisplay";
import { ActionButtons } from "~/components/ActionButtons";
import { Card, CardContent } from "@/components/ui/card";
import { Menu } from "@/components/icons/Menu";
import { DrawerContent } from "@/components/DrawerContent";
import { AssetSection } from "~/components/AssetRow";
import { toast } from "sonner-native";

export default function HomeScreen() {
  const drawerRef = useRef<DrawerLayoutMethods>(null);
  const { logout } = usePara();
  const { refreshWallets, isRefreshing } = useWallet();
  const [hasLoaded, setHasLoaded] = React.useState(false);

  // Initial fetch of wallet data
  useEffect(() => {
    refreshWallets()
      .then(() => {
        setHasLoaded(true);
      })
      .catch((error) => {
        console.error("Error loading wallet data:", error);
        toast.error("Failed to load wallet data", {
          description: "Please check your internet connection and try again.",
        });
        setHasLoaded(true);
      });
  }, [refreshWallets]);

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
        <View className="h-16 flex-row items-center justify-between px-6 border-b border-border bg-card">
          <Image
            source={require("~/assets/para.png")}
            className="h-8 w-8"
            resizeMode="contain"
          />
          <TouchableOpacity
            className="p-2"
            onPress={() => drawerRef.current?.openDrawer()}
            accessibilityLabel="Open menu">
            <Menu className="text-foreground" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 px-6 pt-8">
          <ScrollView showsVerticalScrollIndicator={false}>
            <Card className="w-full bg-card border border-border rounded-lg overflow-hidden shadow-sm">
              <CardContent className="p-6 gap-8">
                <BalanceDisplay />
                <ActionButtons />
              </CardContent>
            </Card>

            <AssetSection />

            <View className="h-10" />
          </ScrollView>
        </View>
      </View>
    </ReanimatedDrawerLayout>
  );
}
