import { usePara } from "@/providers/para/usePara";
import { useWallet } from "@/providers/wallet/useWallet";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function HomeLayout() {
  const { checkAuthState } = usePara();
  const { refreshWallets } = useWallet();

  useEffect(() => {
    const refreshData = async () => {
      if (await checkAuthState()) {
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
