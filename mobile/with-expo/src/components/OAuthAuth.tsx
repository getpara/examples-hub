import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { para } from "../para";
import { openAuthSessionAsync } from "expo-web-browser";
import * as Linking from "expo-linking";
import { StatusDisplay } from "./common/StatusDisplay";
import { SecurityChoice } from "./SecurityChoice";
import { AuthState, AuthStateSignup } from "@getpara/react-native-wallet";

// OAuth providers
type SupportedOAuthMethod = "GOOGLE" | "FARCASTER";

interface OAuthAuthProps {
  onSuccess: () => void;
  onShowSecurityChoice?: () => void;
  onHideSecurityChoice?: () => void;
}

// Must match scheme in app.json for deep linking
const APP_SCHEME = "para-sdk-demo";
const APP_CALLBACK_URL = `${APP_SCHEME}://para`;
const FARCASTER_CALLBACK_URL = `${APP_CALLBACK_URL}?method=login`;

type ParaWithInternals = typeof para & {
  constructPortalUrl?: (
    type: string,
    opts?: Record<string, unknown>
  ) => Promise<string>;
};

export const OAuthAuth: React.FC<OAuthAuthProps> = ({
  onSuccess,
  onShowSecurityChoice,
  onHideSecurityChoice,
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pendingOAuthProvider, setPendingOAuthProvider] =
    useState<SupportedOAuthMethod | null>(null);
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [showSecurityChoice, setShowSecurityChoice] = useState(false);

  const touchSession = async () => {
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

  const waitForLoginAndFinish = async () => {
    setStatus("Finishing login...");
    await para.waitForLogin({});
    onSuccess();
  };

  const waitForSignupAndFinish = async () => {
    setStatus("Finalizing account...");
    await para.waitForSignup({});
    // @ts-expect-error: userSetupAfterLogin is protected on ParaCore but required to hydrate session after signup
    await para.userSetupAfterLogin();
    setShowSecurityChoice(false);
    onSuccess();
  };

  const handleDeeplink = useCallback(
    async (url: string) => {
      // Check for portal OAuth callback (status param is optional)
      if (url.startsWith(APP_CALLBACK_URL)) {
        const urlObj = new URL(url);
        const methodParam = urlObj.searchParams.get("method");

        if (methodParam === "login" && pendingOAuthProvider === "FARCASTER") {
          console.info("[OAuthAuth] Received Farcaster deeplink:", url);
          return;
        }

        const status = urlObj.searchParams.get("status") ?? "complete";
        console.info("[OAuthAuth] Portal callback status", { status, url });

        if (status === "complete") {
          para.isEnclaveUser = true;
          setStatus("Finishing login...");
          try {
            const waitForLoginResult = await para.waitForLogin();
            const needsWallet =
              waitForLoginResult?.needsWallet ||
              (Array.isArray(para.currentWalletIdsArray)
                ? para.currentWalletIdsArray.length === 0
                : false);

            if (
              needsWallet &&
              typeof para.waitForWalletCreation === "function"
            ) {
              setStatus("Creating your Para wallet...");
              await para.waitForWalletCreation({});
            }

            setStatus("");
            onSuccess();
          } catch (err) {
            console.error(
              "[OAuthAuth] Error completing login after portal callback",
              err
            );
            setError(
              err instanceof Error ? err.message : "Failed to finish login"
            );
            setStatus("");
          }
        } else if (status === "new_user") {
          para.isEnclaveUser = true;
          try {
            setStatus("Creating your Para account...");
            await waitForSignupAndFinish();
          } catch (finishError) {
            console.error(
              "[OAuthAuth] Error finishing signup after portal callback",
              finishError
            );
            setError(
              finishError instanceof Error
                ? finishError.message
                : "Failed to finish signup"
            );
          }
        }
        setPendingOAuthProvider(null);
        setLoading(false);
        return;
      }

      // Original Para redirect handling (fallback for non-portal flow)
      if (
        url.includes(FARCASTER_CALLBACK_URL) &&
        pendingOAuthProvider &&
        pendingOAuthProvider !== "FARCASTER"
      ) {
        try {
          setStatus("Verifying authentication...");

          const verifiedAuthState = await para.verifyOAuth({
            method: pendingOAuthProvider,
          });
          setAuthState(verifiedAuthState);

          if (verifiedAuthState.stage === "login") {
            if (verifiedAuthState.passwordUrl) {
              setStatus("Redirecting to password login...");
              await openAuthUrl(
                verifiedAuthState.passwordUrl,
                "password login"
              );
              await waitForLoginAndFinish();
            } else {
              setStatus("Logging in with passkey...");
              await para.loginWithPasskey();
              await touchSession();
              onSuccess();
            }
          } else if (verifiedAuthState.stage === "signup") {
            setShowSecurityChoice(true);
            onShowSecurityChoice?.();
            setStatus("");
          } else if (
            verifiedAuthState.stage === "verify" &&
            verifiedAuthState.loginUrl
          ) {
            await openAuthUrl(verifiedAuthState.loginUrl, "one-click signup");
            await waitForSignupAndFinish();
          } else {
            throw new Error("Unexpected authentication state");
          }
        } catch (err) {
          console.error("[OAuthAuth] Error handling deeplink", err);
          setError(
            err instanceof Error ? err.message : "OAuth verification failed"
          );
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
    ]
  );

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
      setError(
        err instanceof Error ? err.message : "OAuth authentication failed"
      );
      setLoading(false);
      setPendingOAuthProvider(null);
    }
  };

  const handleFarcasterAuth = async () => {
    console.info("[OAuthAuth] Starting Farcaster authentication flow");

    setPendingOAuthProvider("FARCASTER");

    try {
      const paraWithInternals = para as ParaWithInternals;

      if (!paraWithInternals.constructPortalUrl) {
        throw new Error(
          "Farcaster portal login is not supported in this SDK version."
        );
      }

      const touchSessionResult = await para.touchSession(true);
      console.info("[OAuthAuth] Prepared Farcaster session lookup", {
        sessionLookupId: touchSessionResult.sessionLookupId,
      });

      const portalUrl = await paraWithInternals.constructPortalUrl(
        "loginFarcaster",
        {
          appScheme: FARCASTER_CALLBACK_URL,
          params: { nativeCallbackUrl: APP_CALLBACK_URL },
        }
      );

      setStatus("Complete authentication in Farcaster portal...");
      const result = await openAuthUrl(portalUrl, "farcaster authentication");

      if (result.type === "success" && result.url) {
        await handleDeeplink(result.url);
        return;
      }

      if (result.type === "cancel" || result.type === "dismiss") {
        console.info("[OAuthAuth] Farcaster authentication cancelled by user");
        setPendingOAuthProvider(null);
        setLoading(false);
        setError("Authentication cancelled");
      }
    } catch (err) {
      console.error("[OAuthAuth] Farcaster portal flow failed", err);
      setError(
        err instanceof Error ? err.message : "Farcaster authentication failed"
      );
      setPendingOAuthProvider(null);
      setLoading(false);
    }
  };

  const handleStandardOAuth = async (provider: SupportedOAuthMethod) => {
    console.info("[OAuthAuth] Starting OAuth flow for provider:", provider);

    setPendingOAuthProvider(provider);

    console.info(
      "[OAuthAuth] Getting OAuth URL without appScheme to force portal callback"
    );
    const oauthUrl = await para.getOAuthUrl({
      method: provider,
    });

    console.info("[OAuthAuth] OAuth URL received:", oauthUrl);
    console.info("[OAuthAuth] Expected callback URL:", APP_CALLBACK_URL);

    const result = await openAuthUrl(
      oauthUrl,
      `${provider.toLowerCase()} authentication`
    );

    console.info("[OAuthAuth] Auth session result:", result);

    if (result.type === "success" && result.url) {
      await handleDeeplink(result.url);
      return;
    }

    if (result.type === "cancel" || result.type === "dismiss") {
      console.info("[OAuthAuth] Authentication cancelled by user");
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
        setStatus("Creating passkey...");
        await para.registerPasskey(authState as AuthStateSignup);
        setStatus("");
        onHideSecurityChoice?.();
        onSuccess();
      } else {
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
              disabled={loading}
            >
              <Text style={styles.providerButtonText}>{provider.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <SecurityChoice onChoice={handleSecurityChoice} loading={loading} />
      )}

      <StatusDisplay status={status} error={error} />
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
