import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Button } from "@rneui/themed";
import { useRouter } from "expo-router";
import { para } from "@/client/para";
import { OAuthMethod } from "@getpara/react-native-wallet";
import { openAuthSessionAsync } from "expo-web-browser";

import { openURL } from "expo-linking";

const APP_SCHEME = "para-expo";

export default function OauthAuthScreen() {
  const router = useRouter();

  const handleOauthLogin = async (provider: OAuthMethod) => {
    if (!provider) return;

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

    const { email, userExists } = await para.waitForOAuth();

    if (userExists) {
      console.log("User exists, logging in with email:", email);
      await para.login({ email: email! });
      router.navigate("../home");
    } else {
      console.log("User does not exist, registering with email:", email);
      const biometricId = await para.getSetUpBiometricsURL({ isForNewDevice: false, authType: "email" });
      if (biometricId) {
        await para.registerPasskey({ email: email!, biometricsId: biometricId });
        router.navigate("../home");
      }
    }
  };

  const handleFarcasterLogin = async () => {
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {Object.values(OAuthMethod).map((provider, index) => (
          <Button
            key={provider}
            title={`Login with ${provider}`}
            onPress={() => handleOauthLogin(provider)}
            containerStyle={[
              styles.buttonContainer,
              index !== Object.values(OAuthMethod).length - 1 && styles.buttonMargin,
            ]}
            buttonStyle={styles.button}
            titleStyle={styles.buttonTitle}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#fc6c58",
    borderRadius: 8,
    paddingVertical: 14,
  },
  buttonContainer: {
    width: "100%",
  },
  buttonMargin: {
    marginBottom: 16,
  },
  buttonTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
});
