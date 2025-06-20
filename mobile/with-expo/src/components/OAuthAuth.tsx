import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { para } from "../para";
import { openAuthSessionAsync } from "expo-web-browser";
import * as Linking from "expo-linking";
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
      if (url.includes('://para?method=login') && pendingOAuthProvider) {
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
          setError(err instanceof Error ? err.message : "OAuth verification failed");
        } finally {
          setPendingOAuthProvider(null);
          setLoading(false);
        }
      }
    };

    // Listen for incoming links
    const subscription = Linking.addEventListener('url', (event) => {
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
    // Set the pending provider so we know which OAuth to verify when deeplink arrives
    setPendingOAuthProvider(provider);
    
    // Get OAuth URL from Para
    const oauthUrl = await para.getOAuthUrl({
      method: provider,
      deeplinkUrl: APP_SCHEME, // This will be used as {deeplinkUrl}://para?method=login
    });

    // Open browser for OAuth flow
    // Note: We don't await the result here because the actual redirect
    // will be handled by the deeplink listener
    const result = await openAuthSessionAsync(oauthUrl, APP_SCHEME, {
      preferEphemeralSession: false,
    });

    // If the browser was dismissed without completing OAuth
    if (result.type === 'cancel' || result.type === 'dismiss') {
      setPendingOAuthProvider(null);
      setLoading(false);
      setError('Authentication cancelled');
    }
    // The success case is handled by the deeplink listener
  };

  const oauthProviders: {
    method: SupportedOAuthMethod;
    name: string;
    color: string;
  }[] = [
    { method: "GOOGLE", name: "Google", color: "#4285F4" },
    { method: "DISCORD", name: "Discord", color: "#5865F2" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Continue with</Text>

      <View style={styles.providersContainer}>
        {oauthProviders.map((provider) => (
          <TouchableOpacity
            key={provider.method}
            style={[styles.providerButton, { backgroundColor: provider.color }, loading && styles.disabledButton]}
            onPress={() => handleOAuthLogin(provider.method)}
            disabled={loading}>
            <Text style={styles.providerButtonText}>{provider.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
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
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  providersContainer: {
    gap: 12,
  },
  providerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  providerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#666",
    fontSize: 14,
  },
});
