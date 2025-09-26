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

  const openAuthUrl = useCallback(async (url: string, context: string) => {
    const authUrl = new URL(url);
    authUrl.searchParams.set("nativeCallbackUrl", APP_CALLBACK_URL);
    const finalUrl = authUrl.toString();
    const result = await openAuthSessionAsync(finalUrl, APP_CALLBACK_URL);
    if (result.type !== "success") {
      throw new Error(`${context} cancelled`);
    }
    return result;
  }, []);

  const resetOAuthState = useCallback(() => {
    setPendingOAuthProvider(null);
    setLoading(false);
  }, []);

  const finalizeLogin = useCallback(async () => {
    setStatus("Finishing login...");
    const waitForLoginResult = await para.waitForLogin();

    if (
      waitForLoginResult?.needsWallet &&
      typeof para.waitForWalletCreation === "function"
    ) {
      setStatus("Creating your Para wallet...");
      await para.waitForWalletCreation({});
    }

    onSuccess();
  }, [onSuccess]);

  const finalizeSignup = useCallback(async () => {
    setStatus("Finalizing account...");
    await para.waitForSignup({});
    // @ts-expect-error: userSetupAfterLogin is protected on ParaCore but required to hydrate session after signup
    await para.userSetupAfterLogin();
    setShowSecurityChoice(false);
    onSuccess();
  }, [onSuccess]);

  const handleLegacyLogin = useCallback(
    async (state: AuthState) => {
      if (state.stage !== "login") {
        return;
      }

      if (state.passwordUrl) {
        setStatus("Redirecting to password login...");
        await openAuthUrl(state.passwordUrl, "password login");
        await finalizeLogin();
        return;
      }

      setStatus("Logging in with passkey...");
      await para.loginWithPasskey();
      await finalizeLogin();
    },
    [openAuthUrl, finalizeLogin]
  );

  const handleLegacyVerify = useCallback(
    async (state: AuthState) => {
      if (state.stage !== "verify" || !state.loginUrl) {
        throw new Error("Unexpected authentication state");
      }

      await openAuthUrl(state.loginUrl, "one-click signup");
      await finalizeSignup();
    },
    [openAuthUrl, finalizeSignup]
  );

  const handleLegacyOAuthCallback = useCallback(async () => {
    if (!pendingOAuthProvider || pendingOAuthProvider === "FARCASTER") {
      return;
    }

    try {
      console.info("[OAuthAuth] Handling legacy OAuth callback", {
        provider: pendingOAuthProvider,
      });
      setStatus("Verifying authentication...");

      const verifiedAuthState = await para.verifyOAuth({
        method: pendingOAuthProvider,
      });
      setAuthState(verifiedAuthState);

      switch (verifiedAuthState.stage) {
        case "login":
          await handleLegacyLogin(verifiedAuthState);
          break;
        case "signup":
          setShowSecurityChoice(true);
          onShowSecurityChoice?.();
          setStatus("");
          break;
        case "verify":
          await handleLegacyVerify(verifiedAuthState);
          break;
        default:
          throw new Error("Unexpected authentication state");
      }
    } catch (err) {
      console.error("[OAuthAuth] Error handling OAuth callback", err);
      setError(
        err instanceof Error ? err.message : "OAuth verification failed"
      );
    } finally {
      resetOAuthState();
    }
  }, [
    pendingOAuthProvider,
    handleLegacyLogin,
    handleLegacyVerify,
    onShowSecurityChoice,
    resetOAuthState,
  ]);

  const handlePortalCallback = useCallback(
    async (url: string) => {
      const urlObj = new URL(url);
      const methodParam = urlObj.searchParams.get("method");

      console.info("[OAuthAuth] Portal callback received", { url });

      if (methodParam === "login" && pendingOAuthProvider === "FARCASTER") {
        console.info("[OAuthAuth] Received Farcaster deeplink:", url);
        return;
      }

      const statusParam = urlObj.searchParams.get("status") ?? "complete";

      try {
        para.isEnclaveUser = true;

        if (statusParam === "complete") {
          await finalizeLogin();
        } else if (statusParam === "new_user") {
          await finalizeSignup();
        } else {
          console.warn("[OAuthAuth] Unknown portal status", statusParam);
        }
      } catch (err) {
        console.error("[OAuthAuth] Error completing portal callback", err);
        const fallbackMessage =
          statusParam === "new_user"
            ? "Failed to finish signup"
            : "Failed to finish login";
        setError(err instanceof Error ? err.message : fallbackMessage);
      } finally {
        resetOAuthState();
      }
    },
    [pendingOAuthProvider, finalizeLogin, finalizeSignup, resetOAuthState]
  );

  const handleDeeplink = useCallback(
    async (url: string) => {
      if (url.startsWith(FARCASTER_CALLBACK_URL)) {
        if (pendingOAuthProvider === "FARCASTER") {
          console.info("[OAuthAuth] Ignoring intermediate Farcaster callback", {
            url,
          });
          return;
        }

        await handleLegacyOAuthCallback();
        return;
      }

      if (url.startsWith(APP_CALLBACK_URL)) {
        await handlePortalCallback(url);
      }
    },
    [pendingOAuthProvider, handleLegacyOAuthCallback, handlePortalCallback]
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

      switch (result.type) {
        case "success": {
          if (result.url) {
            await handleDeeplink(result.url);
          }
          return;
        }
        case "cancel":
        case "dismiss": {
          console.info(
            "[OAuthAuth] Farcaster authentication cancelled by user"
          );
          setPendingOAuthProvider(null);
          setLoading(false);
          setError("Authentication cancelled");
          return;
        }
        default:
          return;
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
