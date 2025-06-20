import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { para } from "../para";
import InAppBrowser from "react-native-inappbrowser-reborn";
import { StatusDisplay } from "./common/StatusDisplay";

// Type for OAuth methods supported by getOAuthUrl and verifyOAuth
type SupportedOAuthMethod = "GOOGLE" | "DISCORD" | "TWITTER" | "APPLE" | "FACEBOOK";

interface OAuthAuthProps {
  onSuccess: () => void;
}

const APP_SCHEME = "para-sdk-demo";

export const OAuthAuth: React.FC<OAuthAuthProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pendingOAuthProvider, setPendingOAuthProvider] = useState<SupportedOAuthMethod | null>(null);

  // Listen for deeplinks
  useEffect(() => {
    const handleDeeplink = async (url: string) => {
      // Check if this is a Para OAuth callback
      if (url.includes("://para?method=login") && pendingOAuthProvider) {
        try {
          setStatus("Verifying authentication...");

          // Now that we received the deeplink, verify the OAuth
          const authState = await para.verifyOAuth({
            method: pendingOAuthProvider,
          });

          if (authState.stage === "login") {
            // Existing user - proceed with passkey login
            setStatus("Logging in with passkey...");
            await para.loginWithPasskey();
            setStatus("");
            onSuccess();
          } else if (authState.stage === "signup") {
            // New user - register passkey
            setStatus("Creating passkey...");
            await para.registerPasskey(authState);
            setStatus("");
            onSuccess();
          } else {
            throw new Error("Unexpected authentication state");
          }
        } catch (err) {
          console.error(err);
          setError(err instanceof Error ? err.message : "OAuth verification failed");
        } finally {
          setPendingOAuthProvider(null);
          setLoading(false);
        }
      }
    };

    // Listen for incoming links
    const subscription = Linking.addEventListener("url", (event) => {
      handleDeeplink(event.url);
    });

    // Check if app was opened with a link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeeplink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [pendingOAuthProvider, onSuccess]);

  const handleOAuthLogin = async (provider: SupportedOAuthMethod) => {
    setLoading(true);
    setError("");
    setStatus(`Authenticating with ${provider}...`);

    try {
      await handleStandardOAuth(provider);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "OAuth authentication failed");
      setLoading(false);
      setPendingOAuthProvider(null);
    }
  };

  const handleStandardOAuth = async (provider: SupportedOAuthMethod) => {
    // Set the pending provider so we know which OAuth to verify when deeplink arrives
    setPendingOAuthProvider(provider);

    // Get OAuth URL from Para
    const oauthUrl = await para.getOAuthUrl({
      method: provider,
      deeplinkUrl: APP_SCHEME, // This will be used as {deeplinkUrl}://para?method=login
    });

    // Open browser for OAuth flow
    try {
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.openAuth(oauthUrl, APP_SCHEME, {
          // iOS
          ephemeralWebSession: false,
          // Android
          showTitle: true,
          enableUrlBarHiding: true,
          enableDefaultShare: false,
        });

        if (result.type === "cancel") {
          setPendingOAuthProvider(null);
          setLoading(false);
          setError("Authentication cancelled");
        }
        // The success case is handled by the deeplink listener
      } else {
        // Fallback to external browser
        await Linking.openURL(oauthUrl);
      }
    } catch (error) {
      setPendingOAuthProvider(null);
      setLoading(false);
      setError("Failed to open authentication window");
    }
  };

  const oauthProviders: {
    method: SupportedOAuthMethod;
    name: string;
  }[] = [
    { method: "GOOGLE", name: "Continue with Google" },
    { method: "DISCORD", name: "Continue with Discord" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.providersContainer}>
        {oauthProviders.map((provider) => (
          <TouchableOpacity
            key={provider.method}
            style={[styles.providerButton, loading && styles.disabledButton]}
            onPress={() => handleOAuthLogin(provider.method)}
            disabled={loading}>
            <Text style={styles.providerButtonText}>{provider.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <StatusDisplay
        status={status}
        error={error}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  providersContainer: {
    gap: 12,
  },
  providerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 4,
    backgroundColor: "#000000",
  },
  providerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
});