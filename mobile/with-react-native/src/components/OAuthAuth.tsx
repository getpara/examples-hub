import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { para } from "../para";
import InAppBrowser from "react-native-inappbrowser-reborn";
import { StatusDisplay } from "./common/StatusDisplay";
import { SecurityChoice } from "./SecurityChoice";

// OAuth providers supported by Para SDK
type SupportedOAuthMethod = "GOOGLE" | "DISCORD" | "TWITTER" | "APPLE" | "FACEBOOK";

interface OAuthAuthProps {
  onSuccess: () => void;
  onShowSecurityChoice?: () => void;
  onHideSecurityChoice?: () => void;
}

// App scheme for OAuth redirects - must match app.json and platform configs
const APP_SCHEME = "para-sdk-demo";

export const OAuthAuth: React.FC<OAuthAuthProps> = ({ onSuccess, onShowSecurityChoice, onHideSecurityChoice }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pendingOAuthProvider, setPendingOAuthProvider] = useState<SupportedOAuthMethod | null>(null);
  const [showSecurityChoice, setShowSecurityChoice] = useState(false);
  const [authState, setAuthState] = useState<any>(null);

  // Handle OAuth redirect deeplinks
  useEffect(() => {
    const handleDeeplink = async (url: string) => {
      // Check if this is a Para OAuth callback
      if (url.includes("://para?method=login") && pendingOAuthProvider) {
        try {
          setStatus("Verifying authentication...");

          // Verify OAuth authentication with Para
          const verifiedAuthState = await para.verifyOAuth({
            method: pendingOAuthProvider,
          });
          setAuthState(verifiedAuthState);

          if (verifiedAuthState.stage === "login") {
            // Existing user - check if they use password or passkey
            if (verifiedAuthState.passwordUrl) {
              // User has password-based security
              setStatus("Redirecting to password login...");
              const APP_SCHEME_OAUTH = "para-sdk-demo";
              const APP_SCHEME_REDIRECT_URL = `${APP_SCHEME_OAUTH}://para`;
              
              await InAppBrowser.openAuth(verifiedAuthState.passwordUrl, APP_SCHEME_REDIRECT_URL);
              await para.waitForLogin({});
              setStatus("");
              onSuccess();
            } else {
              // User has passkey-based security
              setStatus("Logging in with passkey...");
              await para.loginWithPasskey();
              setStatus("");
              onSuccess();
            }
          } else if (verifiedAuthState.stage === "signup") {
            // New user - show security choice
            setShowSecurityChoice(true);
            onShowSecurityChoice?.();
            setStatus("");
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
  }, [pendingOAuthProvider, onSuccess, onShowSecurityChoice]);

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
    // Track which provider we're authenticating with
    setPendingOAuthProvider(provider);

    // Get OAuth URL with app redirect scheme
    const oauthUrl = await para.getOAuthUrl({
      method: provider,
      deeplinkUrl: APP_SCHEME, // Redirects to: {APP_SCHEME}://para?method=login
    });

    // Open in-app browser for OAuth
    try {
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.openAuth(oauthUrl, APP_SCHEME, {
          // iOS options
          ephemeralWebSession: false,
          // Android options
          showTitle: true,
          enableUrlBarHiding: true,
          enableDefaultShare: false,
        });

        if (result.type === "cancel") {
          setPendingOAuthProvider(null);
          setLoading(false);
          setError("Authentication cancelled");
        }
        // Success redirects to deeplink handler above
      } else {
        // Fallback to external browser
        await Linking.openURL(oauthUrl);
      }
    } catch (err) {
      setPendingOAuthProvider(null);
      setLoading(false);
      setError("Failed to open authentication window");
    }
  };

  const handleSecurityChoice = async (choice: 'passkey' | 'password') => {
    setLoading(true);
    setError('');

    try {
      if (choice === 'passkey') {
        // Register passkey for future logins
        setStatus('Creating passkey...');
        await para.registerPasskey(authState);
        setStatus('');
        onHideSecurityChoice?.();
        onSuccess();
      } else {
        // Redirect to password creation
        setStatus('Redirecting to password creation...');
        const APP_SCHEME_OAUTH = 'para-sdk-demo';
        const APP_SCHEME_REDIRECT_URL = `${APP_SCHEME_OAUTH}://para`;
        
        await InAppBrowser.openAuth(authState.passwordUrl, APP_SCHEME_REDIRECT_URL);
        await para.waitForWalletCreation({});
        setStatus('');
        onHideSecurityChoice?.();
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Security setup failed');
    } finally {
      setLoading(false);
      setShowSecurityChoice(false);
      setPendingOAuthProvider(null);
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
      {!showSecurityChoice ? (
        <>
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
        </>
      ) : (
        <SecurityChoice onChoice={handleSecurityChoice} loading={loading} />
      )}

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