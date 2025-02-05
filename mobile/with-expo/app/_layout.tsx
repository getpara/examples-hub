import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { capsuleClient } from "@/client/capsule";

export default function RootLayout() {
  useEffect(() => {
    const initializeCapsuleClient = async () => {
      try {
        await capsuleClient.logout();
        await capsuleClient.clearStorage("all");
        await capsuleClient.init();
      } catch (error) {
        console.error("Failed to initialize capsule client:", error);
      }
    };

    initializeCapsuleClient();
  }, []);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="auth/with-email" />
      <Stack.Screen name="auth/with-phone" />
      {/* <Stack.Screen name="auth/with-oauth" /> */}
      <Stack.Screen name="sign/with-evm" />
      <Stack.Screen name="sign/with-cosmos" />
      <Stack.Screen name="sign/with-solana" />
    </Stack>
  );
}
