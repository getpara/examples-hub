import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { para } from "../para";
import { openAuthSessionAsync } from "expo-web-browser";
import * as Linking from "expo-linking";
import { StatusDisplay } from "./common/StatusDisplay";

// OAuth providers supported by Para SDK
type SupportedOAuthMethod = "GOOGLE" | "DISCORD" | "TWITTER" | "APPLE" | "FACEBOOK";

interface OAuthAuthProps {
  onSuccess: () => void;
}

// Must match scheme in app.json for deep linking
const APP_SCHEME = "para-sdk-demo";

export const OAuthAuth: React.FC<OAuthAuthProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pendingOAuthProvider, setPendingOAuthProvider] = useState<SupportedOAuthMethod | null>(null);

  // Handle OAuth redirect back to app
  useEffect(() => {
    const handleDeeplink = async (url: string) => {
      // Para redirects to {scheme}://para?method=login after OAuth
      if (url.includes("://para?method=login") && pendingOAuthProvider) {
        try {
          setStatus("Verifying authentication...");

          // Complete OAuth flow with Para backend
          const authState = await para.verifyOAuth({
            method: pendingOAuthProvider,
          });

          if (authState.stage === "login") {
            // Known OAuth account - authenticate with passkey
            setStatus("Logging in with passkey...");
            await para.loginWithPasskey();
            setStatus("");
            onSuccess();
          } else if (authState.stage === "signup") {
            // First time OAuth - create passkey
            setStatus("Creating passkey...");
            await para.registerPasskey(authState);
            setStatus("");
            onSuccess();
          } else {
            throw new Error("Unexpected authentication state");
          }
        } catch (err) {
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
      setError(err instanceof Error ? err.message : "OAuth authentication failed");
      setLoading(false);
      setPendingOAuthProvider(null);
    }
  };

  const handleStandardOAuth = async (provider: SupportedOAuthMethod) => {
    // Track which provider we're authenticating with
    setPendingOAuthProvider(provider);

    // Get provider-specific OAuth URL from Para
    const oauthUrl = await para.getOAuthUrl({
      method: provider,
      deeplinkUrl: APP_SCHEME, // Redirect URI: {scheme}://para?method=login
    });

    // Launch in-app browser for OAuth consent
    const result = await openAuthSessionAsync(oauthUrl, APP_SCHEME, {
      preferEphemeralSession: false, // Allow saved sessions
    });

    // Handle browser dismissal (success handled by deeplink)
    if (result.type === "cancel" || result.type === "dismiss") {
      setPendingOAuthProvider(null);
      setLoading(false);
      setError("Authentication cancelled");
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
