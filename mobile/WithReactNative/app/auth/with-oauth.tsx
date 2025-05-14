import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Button, Text } from "@rneui/themed";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { para } from "../../client/para";
import { OAuthMethod } from "@getpara/react-native-wallet";
import { InAppBrowser } from "react-native-inappbrowser-reborn";
import { Linking } from "react-native";
import { RootStackParamList } from "../../types";

const APP_SCHEME = "para-rn";

export default function OauthAuthScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleOauthLogin = async (provider: OAuthMethod) => {
    if (!provider) return;
    setIsLoading(true);

    try {
      if (provider === OAuthMethod.FARCASTER) {
        handleFarcasterLogin();
        return;
      }

      const oauthUrl = await para.getOAuthURL({
        method: provider,
        deeplinkUrl: APP_SCHEME,
      });

      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.openAuth(oauthUrl, APP_SCHEME, {
          ephemeralWebSession: false,
          preferredBarTintColor: "#fc6c58",
          preferredControlTintColor: "white",
          showTitle: false,
          enableUrlBarHiding: true,
          enableDefaultShare: false,
        });

        if (result.type === "success") {
          const { email, userExists } = await para.waitForOAuth();

          if (userExists) {
            console.log("User exists, logging in with email:", email);
            await para.login({ email: email! });
            navigation.navigate("Home");
          } else {
            console.log("User does not exist, registering with email:", email);
            const biometricId = await para.getSetUpBiometricsURL({
              isForNewDevice: false,
              authType: "email",
            });

            if (biometricId) {
              await para.registerPasskey({ email: email!, biometricsId: biometricId });
              navigation.navigate("Home");
            }
          }
        }
      } else {
        // Fallback to external browser
        Linking.openURL(oauthUrl);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFarcasterLogin = async () => {
    try {
      const farcasterUrl = await para.getFarcasterConnectURL();

      // Using native linking instead of Expo's openURL
      await Linking.openURL(farcasterUrl);

      const { userExists, username } = await para.waitForFarcasterStatus();

      if (userExists) {
        await para.login({ email: username! });
        navigation.navigate("Home");
      } else {
        const biometricId = await para.getSetUpBiometricsURL({
          isForNewDevice: false,
          authType: "email",
        });

        if (biometricId) {
          await para.registerPasskey({ email: username!, biometricsId: biometricId });
          navigation.navigate("Home");
        }
      }
    } catch (error) {
      console.error("Farcaster login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text
          h2
          h2Style={styles.title}>
          OAuth Authentication Demo
        </Text>
        <Text style={styles.subtitle}>
          Test the Para Auth SDK using OAuth providers. Select one of the authentication methods below.
        </Text>
      </View>

      <View style={styles.container}>
        {Object.values(OAuthMethod).map((provider, index) => (
          <Button
            key={provider}
            title={`Login with ${provider}`}
            onPress={() => handleOauthLogin(provider)}
            disabled={isLoading}
            loading={isLoading}
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
  headerContainer: {
    marginBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
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