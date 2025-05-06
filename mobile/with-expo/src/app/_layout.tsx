import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { RootNavigation } from "@/navigation";
import { ParaProvider } from "@/providers/para/paraContext";
import { PortalHost } from "@rn-primitives/portal";
import { SafeAreaView } from "react-native-safe-area-context";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};

const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
        <ParaProvider>
          <RootNavigation>
            <SafeAreaView className="flex-1">
              <Stack screenOptions={{ headerShown: false }} />
            </SafeAreaView>
          </RootNavigation>
        </ParaProvider>
      </ThemeProvider>
      <PortalHost />
    </>
  );
}
