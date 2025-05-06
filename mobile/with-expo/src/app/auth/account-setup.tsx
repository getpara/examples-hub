import React, { useEffect, useState } from "react";
import { Pressable, View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "~/components/ui/text";
import { usePara } from "@/providers/para/usePara";
import { CheckCircle } from "@/components/icons";
import { AuthNavigationParamsWithBiometrics, SetupStep, STORAGE_KEYS } from "@/types";
import * as SecureStore from "expo-secure-store";

export default function AccountSetupScreen() {
  const { para } = usePara();
  const router = useRouter();
  const { biometricsId, inputType, email, phoneNumber, countryCode } =
    useLocalSearchParams<Record<keyof AuthNavigationParamsWithBiometrics, string>>();

  const [setupStep, setSetupStep] = useState<SetupStep>(SetupStep.INITIALIZING);
  const [error, setError] = useState<string | null>(null);

  const storeCredentials = async () => {
    try {
      if (inputType === "email" && email) {
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_EMAIL, email);
      } else if (inputType === "phone" && phoneNumber && countryCode) {
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_PHONE, phoneNumber);
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_COUNTRY_CODE, countryCode);
      }
    } catch (error) {
      console.error("Error storing credentials:", error);
    }
  };

  const registerPasskey = async () => {
    if (!para || !biometricsId) return;

    setSetupStep(SetupStep.REGISTERING_PASSKEY);
    setError(null);

    try {
      await para.registerPasskey({
        email: email,
        biometricsId: biometricsId,
      });
      await storeCredentials();
      createWallet();
    } catch (error) {
      console.error("Error registering passkey:", error);
      setError("Failed to register passkey. Please try again.");
      setSetupStep(SetupStep.PASSKEY_ERROR);
    }
  };

  const createWallet = async () => {
    if (!para) return;
    setSetupStep(SetupStep.CREATING_WALLET);
    setError(null);

    try {
      await para.createWalletPerType();
      setSetupStep(SetupStep.SUCCESS);
      setTimeout(() => {
        router.navigate("/home");
      }, 1000);
    } catch (error) {
      console.error("Error creating wallet:", error);
      setError("Failed to create wallet. Please try again.");
      setSetupStep(SetupStep.WALLET_ERROR);
    }
  };

  useEffect(() => {
    if (para && biometricsId) {
      registerPasskey();
    }
  }, [para, biometricsId]);

  const renderStepContent = () => {
    switch (setupStep) {
      case SetupStep.INITIALIZING:
      case SetupStep.REGISTERING_PASSKEY:
        return (
          <View className="items-center">
            <ActivityIndicator
              size="large"
              color="#6366f1"
              className="mb-4"
            />
            <Text className="text-center text-muted-foreground">Registering your passkey...</Text>
          </View>
        );

      case SetupStep.CREATING_WALLET:
        return (
          <View className="items-center">
            <ActivityIndicator
              size="large"
              color="#6366f1"
              className="mb-4"
            />
            <Text className="text-center text-muted-foreground">Creating your wallet...</Text>
          </View>
        );

      case SetupStep.PASSKEY_ERROR:
        return (
          <View className="items-center">
            <Text className="text-center text-red-500 mb-4">{error}</Text>
            <Pressable
              onPress={registerPasskey}
              accessibilityRole="button"
              accessibilityLabel="Retry passkey registration"
              className="bg-primary py-3 px-6 rounded-lg">
              <Text className="text-white font-bold">Retry Passkey Registration</Text>
            </Pressable>
          </View>
        );

      case SetupStep.WALLET_ERROR:
        return (
          <View className="items-center">
            <Text className="text-center text-red-500 mb-4">{error}</Text>
            <Pressable
              onPress={createWallet}
              accessibilityRole="button"
              accessibilityLabel="Retry wallet creation"
              className="bg-primary py-3 px-6 rounded-lg">
              <Text className="text-white font-bold">Retry Wallet Creation</Text>
            </Pressable>
          </View>
        );

      case SetupStep.SUCCESS:
        return (
          <View className="items-center">
            <CheckCircle
              size={64}
              className="text-green-500 mb-4"
            />
            <Text className="text-center text-lg font-bold mb-2">Account Created Successfully!</Text>
            <Text className="text-center text-muted-foreground">Your passkey and wallet have been set up.</Text>
            <Text className="text-center text-muted-foreground mt-2">Redirecting to home...</Text>
          </View>
        );
    }
  };

  return (
    <View className="flex-1 bg-background px-6">
      <View className="pt-6">
        <Text className="text-5xl font-bold text-foreground">Account Setup</Text>
        <Text className="mt-4 text-lg text-muted-foreground">Setting up your account and wallet. Please wait...</Text>
      </View>

      <View className="flex-1 justify-center items-center pt-12">{renderStepContent()}</View>

      <View className="pb-6">
        <Text className="text-center text-muted-foreground text-sm">
          This is a demo application showcasing the Para React Native Wallet SDK usage.
        </Text>
      </View>
    </View>
  );
}
