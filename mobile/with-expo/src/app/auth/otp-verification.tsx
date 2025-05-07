import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "@/components/icons/ArrowLeft";
import { CustomOTPInput } from "@/components/OtpInput";
import { Text } from "~/components/ui/text";
import { usePara } from "@/providers/para/usePara";
import { AuthNavigationParams, InputType } from "@/types";

export default function OtpVerificationScreen() {
  const { para } = usePara();
  const router = useRouter();
  const params = useLocalSearchParams<Record<keyof AuthNavigationParams, string>>();
  const inputType = params.inputType as InputType;

  const handleBack = () => {
    router.back();
  };

  const handleComplete = async (code: string) => {
    if (!para) return;

    try {
      const biometricsId = await (inputType === "email"
        ? para.verifyEmailBiometricsId({ verificationCode: code })
        : para.verifyPhoneBiometricsId({ verificationCode: code }));

      if (!biometricsId) {
        console.error("Verification failed, biometrics ID not returned.");
        return;
      }

      router.navigate({
        pathname: "/auth/account-setup",
        params: { biometricsId, ...params },
      });
    } catch (error) {
      console.error("Error verifying code:", error);
    }
  };

  const handleResend = async () => {
    if (!para) return;
    try {
      await (inputType === "email" ? para.resendVerificationCode() : para.resendVerificationCodeByPhone());
    } catch (error) {
      console.error("Error resending verification code:", error);
    }
  };

  return (
    <View className="flex-1 bg-background px-6">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}>
        <View className="pt-6">
          <Pressable
            onPress={handleBack}
            className="mb-6 p-2"
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <ArrowLeft
              size={24}
              className="text-muted-foreground"
            />
          </Pressable>

          <Text className="text-5xl font-bold text-foreground">Verification</Text>
          <Text className="mt-4 text-lg text-muted-foreground">
            Enter the verification code we sent to your device.
          </Text>
        </View>

        <View className="flex-1 pt-12">
          <CustomOTPInput
            maxLength={6}
            onComplete={handleComplete}
            onClear={() => {}}
            autoComplete={false}
          />

          <View className="mt-8 items-center">
            <Text className="text-center text-muted-foreground mb-4">Didn't receive the code?</Text>
            <Pressable
              onPress={handleResend}
              accessibilityRole="button"
              accessibilityLabel="Resend verification code"
              className="p-2">
              <Text className="text-primary font-bold text-lg">Resend Code</Text>
            </Pressable>
          </View>
        </View>

        <View className="pb-6">
          <Text className="text-center text-muted-foreground text-sm">
            This is a demo application showcasing the Para React Native Wallet SDK usage.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
