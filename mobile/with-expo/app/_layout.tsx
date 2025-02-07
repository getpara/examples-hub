import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { para } from "@/client/para";

export default function RootLayout() {
  useEffect(() => {
    const initializeParaClient = async () => {
      try {
        await para.init();
      } catch (error) {
        console.error("Failed to initialize para client:", error);
      }
    };

    initializeParaClient();
  }, []);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="auth/with-email" />
      <Stack.Screen name="auth/with-phone" />
      <Stack.Screen name="sign/with-evm" />
      <Stack.Screen name="sign/with-cosmos" />
      <Stack.Screen name="sign/with-solana" />
    </Stack>
  );
}
