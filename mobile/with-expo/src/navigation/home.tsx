import { usePara } from "@/providers/para/usePara";
import { useWallet } from "@/providers/wallet/useWallet";
import { Stack } from "expo-router";
import { useEffect } from "react";

export function HomeNavigation() {
  const { checkAuthState } = usePara();
  const { refreshWallets } = useWallet();

  useEffect(() => {
    const refreshData = async () => {
      const isAuthenticated = await checkAuthState();
      if (isAuthenticated) {
        refreshWallets();
      }
    };

    refreshData();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}>
      <Stack.Screen
        name="index"
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
