import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { ParaProvider } from "@/providers/para/paraContext";
import { usePara } from "@/providers/para/usePara";
import { SafeAreaView } from "react-native-safe-area-context";
import { WalletProvider } from "@/providers/wallet/walletContext";
import { PortalHost } from "@rn-primitives/portal";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ParaProvider>
      <WalletProvider>
        <StatusBar style="dark" />
        <RootStack />
        <PortalHost />
      </WalletProvider>
    </ParaProvider>
  );
}

function RootStack() {
  const { isInitializing, isInitialized, isAuthenticated } = usePara();

  useEffect(() => {
    if (!isInitializing && isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isInitializing, isInitialized]);

  if (isInitializing || !isInitialized) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#ffffff" },
          gestureEnabled: true,
          gestureDirection: "horizontal",
          presentation: "card",
          fullScreenGestureEnabled: true,
        }}>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen
            name="auth"
            options={{
              gestureEnabled: false,
              animation: "fade",
            }}
          />
        </Stack.Protected>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen
            name="home"
            options={{
              animation: "slide_from_right",
            }}
          />
        </Stack.Protected>
      </Stack>
    </SafeAreaView>
  );
}
