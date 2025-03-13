import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { Button } from "@rneui/themed";
import { useRouter } from "expo-router";
import { para } from "@/client/para";
import { OAuthMethod } from "@getpara/react-native-wallet";
import { openAuthSessionAsync, maybeCompleteAuthSession } from "expo-web-browser";

import { openURL } from "expo-linking";

const APP_SCHEME = "para-expo";

export default function OauthAuthScreen() {
  const router = useRouter();

  const handleOauthLogin = async (provider: OAuthMethod) => {
    maybeCompleteAuthSession();

    if (!provider) return;

    if (provider === OAuthMethod.FARCASTER) {
      handleFarcasterLogin();
      return;
    }

    const oauthUrl = await para.getOAuthURL({ method: provider, deeplinkUrl: APP_SCHEME });

    await openAuthSessionAsync(oauthUrl, APP_SCHEME, { preferEphemeralSession: false });
    const { email, userExists } = await para.waitForOAuth();

    if (userExists) {
      await para.login({ email: email! });
      router.navigate("../home");
    } else {
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
      {Object.values(OAuthMethod).map((provider) => (
        <Button
          key={provider}
          title={`Login with ${provider}`}
          onPress={() => handleOauthLogin(provider)}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
        />
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    color: "#333333",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "left",
    fontSize: 16,
    color: "#666666",
    lineHeight: 22,
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: "#fc6c58",
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonContainer: {
    width: "100%",
  },
});
