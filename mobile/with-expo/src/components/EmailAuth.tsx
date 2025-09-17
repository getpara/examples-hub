import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { para } from "../para";
import { openAuthSessionAsync } from "expo-web-browser";
import { Input } from "./common/Input";
import { Button } from "./common/Button";
import { StatusDisplay } from "./common/StatusDisplay";
import { SecurityChoice } from "./SecurityChoice";
import { AuthState, AuthStateSignup } from "@getpara/react-native-wallet";

interface EmailAuthProps {
  onSuccess: () => void;
  onShowVerification?: () => void;
  onHideVerification?: () => void;
  onShowSecurityChoice?: () => void;
  onHideSecurityChoice?: () => void;
}

// App scheme configuration
const APP_SCHEME = "para-sdk-demo://para";

export const EmailAuth: React.FC<EmailAuthProps> = ({
  onSuccess,
  onShowVerification,
  onHideVerification,
  onShowSecurityChoice,
  onHideSecurityChoice,
}) => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [showSecurityChoice, setShowSecurityChoice] = useState(false);
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // Helper to open auth URLs in browser with proper redirect and logging
  const openAuthUrl = async (url: string, context: string) => {
    const authUrl = new URL(url);
    authUrl.searchParams.set("nativeCallbackUrl", APP_SCHEME);
    console.log(`[EmailAuth] Opening ${context} URL`, authUrl.toString());
    const result = await openAuthSessionAsync(authUrl.toString(), APP_SCHEME);
    console.log(`[EmailAuth] ${context} session result`, result);
    if (result.type !== "success") {
      throw new Error(`${context} cancelled`);
    }
    return result;
  };

  const touchSession = async (context: string) => {
    setStatus("Restoring session...");
    const session = await para.touchSession();
    console.log(`[EmailAuth] Session after ${context}`, session);
    setStatus("");
  };

  const waitForLoginAndFinish = async (context: string) => {
    setStatus("Finishing login...");
    const loginResult = await para
      .waitForLogin({ onPoll: () => console.log(`[EmailAuth] waitForLogin polling (${context})`) })
      .catch(err => {
        console.error(`[EmailAuth] waitForLogin error (${context})`, err);
        throw err;
      });
    console.log(`[EmailAuth] waitForLogin resolved (${context})`, loginResult);
    await touchSession(context);
    onSuccess();
  };

  const waitForSignupAndFinish = async () => {
    setStatus("Finalizing account...");
    const signupResult = await para.waitForSignup({
      onPoll: () => console.log("[EmailAuth] waitForSignup polling"),
    });
    console.log("[EmailAuth] waitForSignup resolved", signupResult);
    await touchSession("signup");
    onSuccess();
  };

  useEffect(() => {
    // Call onHideVerification when component unmounts or verification is hidden
    return () => {
      if (showVerification) {
        onHideVerification?.();
      }
    };
  }, [showVerification, onHideVerification]);

  const handleContinue = async () => {
    if (!email) {
      setError("Please enter an email");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("Checking email...");

    try {
      // Para automatically detects if email is new or existing user
      const authStateResult = await para.signUpOrLogIn({ auth: { email } });
      console.log("[EmailAuth] signUpOrLogIn state", authStateResult);
      setAuthState(authStateResult);

      const nextStage = (authStateResult as any)?.nextStage;

      if (authStateResult?.stage === "verify") {
        console.log("[EmailAuth] Stage VERIFY", {
          loginUrl: authStateResult.loginUrl,
          passwordUrl: (authStateResult as AuthStateSignup)?.passwordUrl,
          nextStage,
        });

        if (authStateResult.loginUrl) {
          const isSloLogin = nextStage === "login";

          setShowVerification(false);
          onHideVerification?.();
          setStatus(isSloLogin ? "Complete login in the browser..." : "Complete verification in the browser...");

          await openAuthUrl(
            authStateResult.loginUrl,
            isSloLogin ? "SLO login" : "SLO signup"
          );

          if (isSloLogin) {
            await waitForLoginAndFinish("SLO login");
            return;
          }

          await waitForSignupAndFinish();
          return;
        }

        // New user flow - requires email verification via native UI
        setShowVerification(true);
        onShowVerification?.();
        setStatus("Verification code sent to your email");
      } else if (authStateResult?.stage === "login") {
        // Existing user - check if they use password or passkey
        console.log("[EmailAuth] Stage LOGIN", {
          loginUrl: authStateResult.loginUrl,
          passwordUrl: authStateResult.passwordUrl,
          nextStage,
        });
        if (authStateResult.loginUrl) {
          setStatus("Complete login in the browser...");
          await openAuthUrl(authStateResult.loginUrl, "SLO login");
          await waitForLoginAndFinish("SLO login");
          return;
        } else if (authStateResult.passwordUrl) {
          // User has password-based security
          setStatus("Redirecting to password login...");
          await openAuthUrl(authStateResult.passwordUrl, "password login");
          await waitForLoginAndFinish("password");
        } else {
          // User has passkey-based security
          setStatus("Logging in with passkey...");
          await para.loginWithPasskey();
          console.log("[EmailAuth] loginWithPasskey completed");
          await touchSession("passkey login");
          onSuccess();
        }
      }
    } catch (err) {
      console.error("[EmailAuth] Authentication flow error", err);
      setStatus("");
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode) {
      setError("Please enter verification code");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("Verifying code...");

    try {
      // Verify OTP to confirm email ownership
      const verifiedAuthState = await para.verifyNewAccount({ verificationCode });
      setAuthState(verifiedAuthState);

      // Show security choice instead of auto-creating passkey
      setShowVerification(false);
      setShowSecurityChoice(true);
      onHideVerification?.();
      onShowSecurityChoice?.();
      setStatus("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setLoading(true);
    setError("");
    setStatus("Resending code...");

    try {
      // Request new OTP if previous expired or lost
      await para.resendVerificationCode({ type: "SIGNUP" });
      setStatus("Verification code resent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityChoice = async (choice: "passkey" | "password") => {
    setLoading(true);
    setError("");

    try {
      if (choice === "passkey") {
        // Register passkey for future logins
        setStatus("Creating passkey...");
        if (!authState) {
          setError("Missing authentication state for passkey registration");
          setLoading(false);
          return;
        }
        await para.registerPasskey(authState as AuthStateSignup);
        console.log("[EmailAuth] registerPasskey completed");
        setStatus("");
        onHideSecurityChoice?.();
        onSuccess();
      } else {
        setStatus("Redirecting to password creation...");
        const passwordUrl = (authState as AuthStateSignup)?.passwordUrl;
        if (!passwordUrl) {
          setError("Password URL is missing for password creation");
          setLoading(false);
          return;
        }

        await openAuthUrl(passwordUrl, "password creation");
        const walletCreation = await para.waitForWalletCreation({
          onPoll: () => console.log("[EmailAuth] waitForWalletCreation polling"),
        });
        console.log("[EmailAuth] waitForWalletCreation resolved", walletCreation);
        setStatus("");
        onHideSecurityChoice?.();
        onSuccess();
      }
    } catch (err) {
      console.error("[EmailAuth] Security setup error", err);
      setError(err instanceof Error ? err.message : "Security setup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!showVerification && !showSecurityChoice ? (
        <>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button
            title="Continue"
            onPress={handleContinue}
            loading={loading}
          />
        </>
      ) : showVerification ? (
        <>
          <Text style={styles.subtitle}>Enter verification code sent to {email}</Text>
          <Input
            label="Verification Code"
            value={verificationCode}
            onChangeText={(text) => setVerificationCode(text.slice(0, 6))}
            placeholder="Enter 6-digit code"
            keyboardType="number-pad"
            maxLength={6}
          />

          {(email.endsWith("@usecapsule.com") || email.endsWith("@getpara.com")) && (
            <View style={styles.betaReminder}>
              <Text style={styles.betaReminderText}>
                <Text style={styles.betaBold}>Beta Testing:</Text> Any random OTP will work
              </Text>
            </View>
          )}

          <Button
            title="Verify"
            onPress={handleVerification}
            loading={loading}
          />
          <View style={{ height: 16 }} />
          <Button
            title="Resend Code"
            onPress={resendCode}
            variant="secondary"
            disabled={loading}
          />
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
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  betaReminder: {
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    marginTop: -8,
  },
  betaReminderText: {
    fontSize: 13,
    color: "#666666",
    textAlign: "center",
  },
  betaBold: {
    fontWeight: "700",
    color: "#000000",
  },
});
