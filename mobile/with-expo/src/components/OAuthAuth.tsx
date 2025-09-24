import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { para } from "../para";
import { openAuthSessionAsync } from "expo-web-browser";
import * as Linking from "expo-linking";
import { StatusDisplay } from "./common/StatusDisplay";
import { SecurityChoice } from "./SecurityChoice";
import { AuthState, AuthStateSignup } from "@getpara/react-native-wallet";

// OAuth providers supported by Para SDK
type SupportedOAuthMethod = "GOOGLE" | "DISCORD" | "TWITTER" | "APPLE" | "FACEBOOK" | "FARCASTER";

interface OAuthAuthProps {
  onSuccess: () => void;
  onShowSecurityChoice?: () => void;
  onHideSecurityChoice?: () => void;
}

// Must match scheme in app.json for deep linking
const APP_SCHEME = "para-sdk-demo";
const APP_CALLBACK_URL = `${APP_SCHEME}://para`;

export const OAuthAuth: React.FC<OAuthAuthProps> = ({ onSuccess, onShowSecurityChoice, onHideSecurityChoice }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pendingOAuthProvider, setPendingOAuthProvider] = useState<SupportedOAuthMethod | null>(null);
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [showSecurityChoice, setShowSecurityChoice] = useState(false);

  const touchSession = async (context: string) => {
    setStatus("Restoring session...");
    const session = await para.touchSession();
    if (session?.userId) {
      await para.setUserId(session.userId);
    }
    setStatus("");
    return session;
  };

  const openAuthUrl = async (url: string, context: string) => {
    const authUrl = new URL(url);
    authUrl.searchParams.set("nativeCallbackUrl", APP_CALLBACK_URL);
    const finalUrl = authUrl.toString();
    const result = await openAuthSessionAsync(finalUrl, APP_CALLBACK_URL);
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
    // @ts-expect-error: userSetupAfterLogin is protected on ParaCore but required to hydrate session after portal signup
    await para.userSetupAfterLogin();
    setShowSecurityChoice(false);
    onSuccess();
  };

  const handleDeeplink = useCallback(
    async (url: string) => {
      // Check for portal OAuth callback with status
      if (url.includes(APP_CALLBACK_URL) && url.includes("status=")) {
        const urlObj = new URL(url);
        const status = urlObj.searchParams.get('status');

        if (status === 'complete') {
          // OAuth completed successfully via portal
          para.isEnclaveUser = true;
          // @ts-expect-error: userSetupAfterLogin is protected on ParaCore but required for portal-based auth flows
          await para.userSetupAfterLogin();
          await touchSession("oauth");
          onSuccess();
        } else if (status === 'new_user') {
          para.isEnclaveUser = true;
          try {
            setStatus("Creating your Para account...");
            await waitForSignupAndFinish();
          } catch (error) {
            console.error("[OAuthAuth] Error finishing signup after portal callback", error);
            setError(error instanceof Error ? error.message : "Failed to finish signup");
          }
        }
        setPendingOAuthProvider(null);
        setLoading(false);
        return;
      }

      // Handle Farcaster callback specifically
      if (url.includes("://para?method=login") && pendingOAuthProvider === "FARCASTER") {
        try {
          setStatus("Verifying Farcaster authentication...");

          // Verify Farcaster authentication
          const verifiedAuthState = await para.verifyFarcaster({});
          setAuthState(verifiedAuthState);

          if (verifiedAuthState.stage === "login") {
            // Existing user - use single-click login
            setStatus("Completing login...");
            await para.waitForLogin({});
            await touchSession("farcaster login");
            onSuccess();
          } else if (verifiedAuthState.stage === "signup") {
            // New user - complete signup with single-click
            setStatus("Creating account...");
            await para.waitForSignup({});
            await touchSession("farcaster signup");
            onSuccess();
          } else if (verifiedAuthState.stage === "verify" && verifiedAuthState.loginUrl) {
            // One-click signup flow
            setStatus("Completing one-click signup...");
            await openAuthUrl(verifiedAuthState.loginUrl, "one-click signup");
            await waitForSignupAndFinish();
          }
        } catch (err) {
          console.error("[OAuthAuth] Error handling Farcaster callback", err);
          setError(err instanceof Error ? err.message : "Farcaster authentication failed");
        } finally {
          setPendingOAuthProvider(null);
          setLoading(false);
        }
        return;
      }

      // Original Para redirect handling (fallback for non-portal flow)
      if (url.includes("://para?method=login") && pendingOAuthProvider && pendingOAuthProvider !== "FARCASTER") {
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
    },
    [
      pendingOAuthProvider,
      para,
      touchSession,
      onSuccess,
      setStatus,
      setShowSecurityChoice,
      onShowSecurityChoice,
      setPendingOAuthProvider,
      setLoading,
      openAuthUrl,
      waitForSignupAndFinish,
      waitForLoginAndFinish,
      setAuthState,
      setError,
    ],
  );

  // Handle OAuth redirect back to app
  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      handleDeeplink(event.url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeeplink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [handleDeeplink]);

  const handleOAuthLogin = async (provider: SupportedOAuthMethod) => {
    setLoading(true);
    setError("");
    setStatus(`Authenticating with ${provider}...`);

    try {
      if (provider === "FARCASTER") {
        await handleFarcasterAuth();
      } else {
        await handleStandardOAuth(provider);
      }
    } catch (err) {
      console.error("[OAuthAuth] OAuth launch error", err);
      setError(err instanceof Error ? err.message : "OAuth authentication failed");
      setLoading(false);
      setPendingOAuthProvider(null);
    }
  };

  const handleFarcasterAuth = async () => {
    console.log("[OAuthAuth] Starting Farcaster authentication flow");

    // Track that we're authenticating with Farcaster
    setPendingOAuthProvider("FARCASTER");

    // Get Farcaster connect URI
    console.log("[OAuthAuth] Getting Farcaster connect URI");
    const connectUri = await para.getFarcasterConnectUri({ appScheme: APP_SCHEME });

    console.log("[OAuthAuth] Farcaster connect URI received:", connectUri);

    // Open Farcaster app or browser
    console.log("[OAuthAuth] Opening Farcaster connect URI");
    await Linking.openURL(connectUri);

    // Wait for the user to complete authentication in Farcaster app
    // The deeplink handler will process the callback
    setStatus("Complete authentication in Farcaster app...");
  };

  const handleStandardOAuth = async (provider: SupportedOAuthMethod) => {
    console.log("[OAuthAuth] Starting OAuth flow for provider:", provider);

    // Track which provider we're authenticating with
    setPendingOAuthProvider(provider);

    // Get provider-specific OAuth URL from Para
    // Don't pass appScheme to force API to use portal callback
    console.log("[OAuthAuth] Getting OAuth URL without appScheme to force portal callback");
    const oauthUrl = await para.getOAuthUrl({
      method: provider,
    });

    console.log("[OAuthAuth] OAuth URL received:", oauthUrl);
    console.log("[OAuthAuth] Expected callback URL:", APP_CALLBACK_URL);

    // Launch in-app browser for OAuth consent
    // Use openAuthUrl to add nativeCallbackUrl parameter
    const result = await openAuthUrl(oauthUrl, `${provider.toLowerCase()} authentication`);

    console.log("[OAuthAuth] Auth session result:", result);

    if (result.type === "success" && result.url) {
      await handleDeeplink(result.url);
      return;
    }

    // Handle browser dismissal (success handled by deeplink)
    // Note: openAuthUrl throws on cancel, so this code may not be reached
    if (result.type === "cancel" || result.type === "dismiss") {
      console.log("[OAuthAuth] Authentication cancelled by user");
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
    { method: "FARCASTER", name: "Continue with Farcaster" },
  ];

  return (
    <View style={styles.container}>
      {!showSecurityChoice ? (
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
