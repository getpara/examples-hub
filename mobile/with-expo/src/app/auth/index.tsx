import React, { useEffect, useState } from "react";
import { ScrollView, View, Text } from "react-native";
import * as SecureStore from "expo-secure-store";
import { openAuthSessionAsync } from "expo-web-browser";
import { openURL } from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { OAuthMethod } from "@getpara/react-native-wallet";
import { SmartInput } from "@/components/SmartInput";
import { OAuthProviders } from "@/components/OAuthProviders";
import { Separator } from "@/components/ui/separator";
import { usePara } from "@/providers/para/usePara";
import { InputType, STORAGE_KEYS } from "@/types";
import { APP_SCHEME } from "@/constants";

export default function MainAuthScreen() {
  const router = useRouter();
  const { para } = usePara();
  const param = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(param.email || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [inputType, setInputType] = useState<InputType>("email");

  useEffect(() => {
    const attemptAutoLogin = async () => {
      if (!para) return;

      try {
        const [storedEmail, storedPhone, storedCountryCode] = await Promise.all([
          SecureStore.getItemAsync(STORAGE_KEYS.USER_EMAIL),
          SecureStore.getItemAsync(STORAGE_KEYS.USER_PHONE),
          SecureStore.getItemAsync(STORAGE_KEYS.USER_COUNTRY_CODE),
        ]);

        const loginParams =
          storedEmail || email
            ? { email: storedEmail ?? email }
            : storedPhone && storedCountryCode
            ? { phone: storedPhone, countryCode: storedCountryCode }
            : null;

        if (loginParams) {
          await para.login(loginParams);
          router.navigate("/home");
        }
      } catch (error) {
        console.error("Auto-login error:", error);
      }
    };

    attemptAutoLogin();
  }, [para, router]);

  const handleContinue = async () => {
    if ((!email && inputType === "email") || (!phoneNumber && inputType === "phone") || !para) return;

    try {
      if (inputType === "email") {
        const emailCredentials = { email };
        const userExists = await para.checkIfUserExists(emailCredentials);

        if (userExists) {
          await para.login(emailCredentials);
          router.navigate("/home");
        } else {
          await para.createUser(emailCredentials);
          router.navigate({
            pathname: "/auth/otp-verification",
            params: { email, inputType },
          });
        }
      } else {
        const phoneCredentials = { phone: phoneNumber, countryCode };
        const userExists = await para.checkIfUserExistsByPhone(phoneCredentials);

        if (userExists) {
          await para.login(phoneCredentials);
          router.navigate({ pathname: "/home", params: { phoneNumber, countryCode, inputType } });
        } else {
          await para.createUserByPhone(phoneCredentials);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleOauthLogin = async (provider: OAuthMethod) => {
    if (!provider || !para) return;

    if (provider === OAuthMethod.FARCASTER) {
      console.log("Farcaster login selected");
      handleFarcasterLogin();
      return;
    }
    console.log("OAuth provider selected:", provider);
    const oauthUrl = await para.getOAuthURL({ method: provider, deeplinkUrl: `${APP_SCHEME}://` });
    console.log("OAuth URL:", oauthUrl);
    await openAuthSessionAsync(oauthUrl, APP_SCHEME, {
      preferEphemeralSession: false,
    });

    const { email, userExists } = await para.waitForOAuth();

    if (userExists) {
      await para.login({ email: email! });
      router.navigate("/home");
    } else {
      const biometricsId = await para.getSetUpBiometricsURL({ isForNewDevice: false, authType: "email" });
      if (!biometricsId) return;

      router.navigate({
        pathname: "/auth/account-setup",
        params: { biometricsId, email, inputType: "email" },
      });
    }
  };

  const handleFarcasterLogin = async () => {
    if (!para) return;

    const farcasterUrl = await para.getFarcasterConnectURL();

    await openURL(farcasterUrl);
    const { userExists, username } = await para.waitForFarcasterStatus();

    if (userExists) {
      await para.login({ email: username! });
      router.navigate("../home");
    } else {
      const biometricId = await para.getSetUpBiometricsURL({ isForNewDevice: false, authType: "email" });
      if (biometricId) {
        await para.registerPasskey({ email: username!, biometricsId: biometricId });
        router.navigate("../home");
      }
    }
  };

  return (
    <View className="flex-1 bg-background px-6">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}>
        <View className="pt-6 pb-8">
          <Text className="text-5xl font-bold text-left text-foreground font-figtree">Sign in</Text>
          <Text className="mt-2 text-left text-lg text-muted-foreground font-nunito-sans">
            Welcome to the Para Wallet Demo. Sign in to explore seamless authentication and wallet integration.
          </Text>
        </View>

        <View className="flex-1 pb-8 gap-y-6">
          <SmartInput
            inputType={inputType}
            onInputTypeChange={setInputType}
            onSubmit={handleContinue}
            email={email}
            onEmailChange={setEmail}
            phoneNumber={phoneNumber}
            countryCode={countryCode}
            onPhoneNumberChange={setPhoneNumber}
            onCountryCodeChange={setCountryCode}
          />
          <View className="flex-row items-center gap-x-2">
            <Separator className="flex-1" />
            <Text className="text-center text-muted-foreground">or continue with</Text>
            <Separator className="flex-1" />
          </View>
          <OAuthProviders onSelect={handleOauthLogin} />
        </View>

        <View className="pb-4">
          <Text className="text-sm text-center text-muted-foreground">
            This is a demo application showcasing the Para React Native Wallet SDK usage.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
