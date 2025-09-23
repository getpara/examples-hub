import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { para } from "../para";
import { openAuthSessionAsync } from "expo-web-browser";
import * as Linking from "expo-linking";
import { StatusDisplay } from "./common/StatusDisplay";
import { SecurityChoice } from "./SecurityChoice";
import { AuthState, AuthStateSignup } from "@getpara/react-native-wallet";

// OAuth providers supported by Para SDK
type SupportedOAuthMethod = "GOOGLE" | "DISCORD" | "TWITTER" | "APPLE" | "FACEBOOK";

interface OAuthAuthProps {
  onSuccess: () => void;
  onShowSecurityChoice?: () => void;
  onHideSecurityChoice?: () => void;
}

// Must match scheme in app.json for deep linking
const APP_SCHEME = "para-sdk-demo";
const APP_CALLBACK_URL = `${APP_SCHEME}://para`;
const APP_CALLBACK_LOGIN_URL = `${APP_CALLBACK_URL}?method=login`;

export const OAuthAuth: React.FC<OAuthAuthProps> = ({ onSuccess, onShowSecurityChoice, onHideSecurityChoice }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pendingOAuthProvider, setPendingOAuthProvider] = useState<SupportedOAuthMethod | null>(null);
  const [showSecurityChoice, setShowSecurityChoice] = useState(false);
  const [authState, setAuthState] = useState<AuthState | null>(null);

  const touchSession = async (context: string) => {
    setStatus("Restoring session...");
    await para.touchSession();
    setStatus("");
  };

  const openAuthUrl = async (url: string, context: string) => {
    const authUrl = new URL(url);
    authUrl.searchParams.set("nativeCallbackUrl", APP_CALLBACK_URL);
    const result = await openAuthSessionAsync(authUrl.toString(), APP_CALLBACK_URL);
    if (result.type !== "success") {
      throw new Error(`${context} cancelled`);
    }
    return result;
  };

  const waitForLoginAndFinish = async (context: string) => {
    setStatus("Finishing login...");
    await para.waitForLogin({});
    await touchSession(context);
    onSuccess();
  };

  const waitForSignupAndFinish = async () => {
    setStatus("Finalizing account...");
    await para.waitForSignup({});
    await touchSession("signup");
    onSuccess();
  };

  // Handle OAuth redirect back to app
  useEffect(() => {
    const handleDeeplink = async (url: string) => {
      // Para redirects to {scheme}://para?method=login after OAuth
      if (url.includes("://para?method=login") && pendingOAuthProvider) {
        try {
          setStatus("Verifying authentication...");

          // Complete OAuth flow with Para backend
          const verifiedAuthState = await para.verifyOAuth({
            method: pendingOAuthProvider,
          });
          setAuthState(verifiedAuthState);

          if (verifiedAuthState.stage === "login") {
            // Existing user - check if they use password or passkey
            if (verifiedAuthState.passwordUrl) {
              // User has password-based security
              setStatus("Redirecting to password login...");
              await openAuthUrl(verifiedAuthState.passwordUrl, "password login");
              await waitForLoginAndFinish("password");
            } else {
              // User has passkey-based security
              setStatus("Logging in with passkey...");
              await para.loginWithPasskey();
              await touchSession("passkey login");
              onSuccess();
            }
          } else if (verifiedAuthState.stage === "signup") {
            // New user - show security choice
            setShowSecurityChoice(true);
            onShowSecurityChoice?.();
            setStatus("");
          } else if (verifiedAuthState.stage === "verify" && verifiedAuthState.loginUrl) {
            await openAuthUrl(verifiedAuthState.loginUrl, "one-click signup");
            await waitForSignupAndFinish();
          } else {
            throw new Error("Unexpected authentication state");
          }
        } catch (err) {
          console.error("[OAuthAuth] Error handling deeplink", err);
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
      if (url) {
        handleDeeplink(url);
      }
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
      console.error("[OAuthAuth] OAuth launch error", err);
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
      appScheme: APP_CALLBACK_LOGIN_URL,
    });

    // Launch in-app browser for OAuth consent
    const result = await openAuthSessionAsync(oauthUrl, APP_CALLBACK_URL, {
      preferEphemeralSession: false, // Allow saved sessions
    });

    // Handle browser dismissal (success handled by deeplink)
    if (result.type === "cancel" || result.type === "dismiss") {
      setPendingOAuthProvider(null);
      setLoading(false);
      setError("Authentication cancelled");
    }
  };

  const handleSecurityChoice = async (choice: "passkey" | "password") => {
    setLoading(true);
    setError("");

    try {
      if (choice === "passkey") {
        // Register passkey for future logins
        setStatus("Creating passkey...");
        await para.registerPasskey(authState as AuthStateSignup);
        setStatus("");
        onHideSecurityChoice?.();
        onSuccess();
      } else {
        // Redirect to password creation
        setStatus("Redirecting to password creation...");

        if (authState && (authState as AuthStateSignup).passwordUrl) {
          const passwordUrl = (authState as AuthStateSignup).passwordUrl;
          if (!passwordUrl) {
            throw new Error("Password URL is undefined");
          }
          await openAuthUrl(passwordUrl, "password creation");
          await para.waitForWalletCreation({});
          setStatus("");
          onHideSecurityChoice?.();
          onSuccess();
        } else {
          throw new Error("Missing authentication state for password creation");
        }
      }
    } catch (err) {
      console.error("[OAuthAuth] Security setup error", err);
      setError(err instanceof Error ? err.message : "Security setup failed");
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
        <SecurityChoice
          onChoice={handleSecurityChoice}
          loading={loading}
        />
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
