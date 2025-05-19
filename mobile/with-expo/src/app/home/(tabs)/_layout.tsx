import React, { useRef } from "react";
import { TouchableOpacity, Image } from "react-native";
import { Tabs } from "expo-router";
import ReanimatedDrawerLayout, {
  DrawerType,
  DrawerPosition,
  DrawerLayoutMethods,
} from "react-native-gesture-handler/ReanimatedDrawerLayout";
import { usePara } from "@/hooks/usePara";
import { Home } from "@/components/icons/Home";
import { Menu } from "@/components/icons/Menu";
import { Text } from "@/components/ui/text";
import { AppDrawer } from "@/components/navigation/AppDrawer";
import { AppHeader } from "@/components/navigation/AppHeader";

export default function TabsLayout() {
  const drawerRef = useRef<DrawerLayoutMethods>(null);
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
      renderNavigationView={() => <AppDrawer onLogout={handleLogout} />}
      overlayColor="rgba(0, 0, 0, 0.5)">
      <Tabs
        screenOptions={{
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            headerShown: true,
            title: "Home",
            header: () => (
              <AppHeader>
                <AppHeader.Left>
                  <Image
                    source={require("~/assets/para.png")}
                    className="h-8 w-8"
                    resizeMode="contain"
                  />
                </AppHeader.Left>
                <AppHeader.Right>
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => drawerRef.current?.openDrawer()}
                    accessibilityLabel="Open menu">
                    <Menu className="text-foreground" />
                  </TouchableOpacity>
                </AppHeader.Right>
              </AppHeader>
            ),
            tabBarIcon: ({ focused }) => <Home className={`${focused ? "text-primary" : "text-gray-500"}`} />,
            tabBarLabel: ({ focused }) => (
              <Text className={`text-sm ${focused ? "text-primary" : "text-gray-500"}`}>Home</Text>
            ),
          }}
        />
      </Tabs>
    </ReanimatedDrawerLayout>
  );
}
