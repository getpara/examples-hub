import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { openAuthSessionAsync } from "expo-web-browser";
import { openURL } from "expo-linking";
import { useRouter, useLocalSearchParams } from "expo-router";
import { OAuthMethod } from "@getpara/react-native-wallet";

import { SmartInput } from "@/components/SmartInput";
import { OAuthProviders } from "@/components/OAuthProviders";
import { Separator } from "@/components/ui/separator";
import { usePara } from "@/providers/para/usePara";
import { AuthType } from "@/types";
import { APP_SCHEME } from "@/constants";
import { clearCreds, getCreds } from "@/util/credentialStore";
import { Text } from "@/components/ui/text";
import { credsToParaAuth } from "@/util/authHelpers";

export default function MainAuthScreen() {
  const { para, login } = usePara();
  const router = useRouter();
  const { method, email: oauthEmail } = useLocalSearchParams<{
    method?: string;
    email?: string;
  }>();

  const [countryCode, setCountryCode] = useState("+1");
  const [email, setEmail] = useState("");
  const [inputType, setInputType] = useState<AuthType>("email");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleEmailFlow = useCallback(
    async (targetEmail: string) => {
      const emailCredentials = { email: targetEmail };
      const userExists = await para!.checkIfUserExists(emailCredentials);

      if (userExists) {
        await login({ authType: "email", email: targetEmail });
      } else {
        await para!.createUser(emailCredentials);
        router.navigate({
          pathname: "/auth/otp-verification",
          params: { authType: "email", ...emailCredentials },
        });
      }
    },
    [login, para, router]
  );

  const handlePhoneFlow = useCallback(
    async (phone: string, code: string) => {
      const phoneCredentials = { phone, countryCode: code };
      const userExists = await para!.checkIfUserExistsByPhone(phoneCredentials);

      if (userExists) {
        await login({ authType: "phone", phone, countryCode: code });
      } else {
        await para!.createUserByPhone(phoneCredentials);
        router.navigate({
          pathname: "/auth/otp-verification",
          params: { authType: "phone", ...phoneCredentials },
        });
      }
    },
    [login, para, router]
  );

  useEffect(() => {
    (async () => {
      try {
        const cached = await getCreds();
        if (cached) await login(cached);
      } catch {
        clearCreds();
      }
    })();
  }, [login]);

  useEffect(() => {
    if (para && method === "login" && oauthEmail) {
      handleEmailFlow(oauthEmail as string);
    }
  }, [method, oauthEmail, para, handleEmailFlow, router]);

  const handleContinue = async () => {
    if (!para) return;

    if (inputType === "email" && email) {
      await handleEmailFlow(email);
    } else if (inputType === "phone" && phoneNumber) {
      await handlePhoneFlow(phoneNumber, countryCode);
    }
  };

  const handleOauthLogin = async (provider: OAuthMethod) => {
    if (!provider || !para) return;

    if (provider === OAuthMethod.FARCASTER) {
      handleFarcasterLogin();
      return;
    }

    const oauthUrl = await para.getOAuthURL({
      method: provider,
      deeplinkUrl: APP_SCHEME,
    });

    await openAuthSessionAsync(oauthUrl, APP_SCHEME, {
      preferEphemeralSession: false,
    });
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
      const biometricId = await para.getSetUpBiometricsURL({
        isForNewDevice: false,
        authType: "email",
      });
      if (biometricId) {
        await para.registerPasskey({
          email: username!,
          biometricsId: biometricId,
        });
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
          <Text className="text-5xl  text-left text-foreground font-figtree-bold">Sign In</Text>
          <Text className="mt-2 text-left text-lg text-muted-foreground">
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
