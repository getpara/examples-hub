import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Stack } from "expo-router";
import ErrorIndicator from "@/components/ErrorIndicator";
import { ParaProvider } from "@/providers/para/paraContext";
import { usePara } from "@/providers/para/usePara";
import { SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ParaProvider>
      <StatusBar style="dark" />
      <RootStack />
    </ParaProvider>
  );
}

function RootStack() {
  const { isInitializing, isInitialized, hasError, error, isAuthenticated } = usePara();

  useEffect(() => {
    if (!isInitializing && isInitialized) {
      console.log("App initialized");
      SplashScreen.hideAsync();
    }
  }, [isInitializing, isInitialized]);

  if (isInitializing || !isInitialized) {
    return null;
  }

  if (hasError) {
    return (
      <ErrorIndicator
        title="Initialization error"
        message={error?.message}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="auth" />
        </Stack.Protected>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="home" />
        </Stack.Protected>
      </Stack>
    </SafeAreaView>
  );
}
