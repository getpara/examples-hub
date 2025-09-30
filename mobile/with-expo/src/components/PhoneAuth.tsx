import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { para } from "../para";
import { openAuthSessionAsync } from "expo-web-browser";
import { Input } from "./common/Input";
import { Button } from "./common/Button";
import { StatusDisplay } from "./common/StatusDisplay";
import { SecurityChoice } from "./SecurityChoice";
import { AuthState, AuthStateSignup } from "@getpara/react-native-wallet";

interface PhoneAuthProps {
  onSuccess: () => void;
  onShowVerification?: () => void;
  onHideVerification?: () => void;
  onShowSecurityChoice?: () => void;
  onHideSecurityChoice?: () => void;
}

const APP_SCHEME = "para-sdk-demo://para";

export const PhoneAuth: React.FC<PhoneAuthProps> = ({
  onSuccess,
  onShowVerification,
  onHideVerification,
  onShowSecurityChoice,
  onHideSecurityChoice,
}) => {
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [showSecurityChoice, setShowSecurityChoice] = useState(false);
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const openAuthUrl = async (url: string, context: string) => {
    const authUrl = new URL(url);
    authUrl.searchParams.set("nativeCallbackUrl", APP_SCHEME);
    const result = await openAuthSessionAsync(authUrl.toString(), APP_SCHEME);
    if (result.type !== "success") {
      throw new Error(`${context} cancelled`);
    }
    return result;
  };

  const touchSession = async () => {
    setStatus("Restoring session...");
    await para.touchSession();
    setStatus("");
  };

  const waitForLoginAndFinish = async () => {
    setStatus("Finishing login...");
    await para.waitForLogin({});
    await touchSession();
    onSuccess();
  };

  const waitForSignupAndFinish = async () => {
    setStatus("Finalizing account...");
    await para.waitForSignup({});
    await touchSession();
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
    if (!phone) {
      setError("Please enter a phone number");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("Checking phone number...");

    try {
      // Phone must include country code (e.g., +1 for US)
      const authStateResult = await para.signUpOrLogIn({
        auth: { phone: phone as `+${number}` },
      });
      setAuthState(authStateResult);

      const nextStage = (authStateResult as any)?.nextStage;

      if (authStateResult?.stage === "verify") {
        if (authStateResult.loginUrl) {
          const isOneClickLogin = nextStage === "login";

          setShowVerification(false);
          onHideVerification?.();
          setStatus(
            isOneClickLogin
              ? "Complete login in the browser..."
              : "Complete verification in the browser..."
          );

          await openAuthUrl(
            authStateResult.loginUrl,
            isOneClickLogin ? "one-click login" : "one-click signup"
          );

          if (isOneClickLogin) {
            await waitForLoginAndFinish();
            return;
          }

          await waitForSignupAndFinish();
          return;
        }

        // New phone number - SMS verification required
        setShowVerification(true);
        onShowVerification?.();
        setStatus("Verification code sent via SMS");
      } else if (authStateResult?.stage === "login") {
        // Existing user - check if they use password or passkey
        if (authStateResult.loginUrl) {
          setStatus("Complete login in the browser...");
          await openAuthUrl(authStateResult.loginUrl, "one-click login");
          await waitForLoginAndFinish();
          return;
        } else if (authStateResult.passwordUrl) {
          // User has password-based security
          setStatus("Redirecting to password login...");
          await openAuthUrl(authStateResult.passwordUrl, "password login");
          await waitForLoginAndFinish();
        } else {
          // User has passkey-based security
          setStatus("Logging in with passkey...");
          await para.loginWithPasskey();
          await touchSession();
          onSuccess();
        }
      }
    } catch (err) {
      console.error("[PhoneAuth] Authentication flow error", err);
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
      // Verify SMS code ownership
      const verifiedAuthState = await para.verifyNewAccount({
        verificationCode,
      });
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
        await para.registerPasskey(authState as AuthStateSignup);
        setStatus("");
        onHideSecurityChoice?.();
        onSuccess();
      } else {
        // Redirect to password creation
        setStatus("Redirecting to password creation...");

        if (
          authState &&
          "passwordUrl" in authState &&
          typeof authState.passwordUrl === "string"
        ) {
          await openAuthUrl(authState.passwordUrl, "password creation");
          await para.waitForWalletCreation({});
          setStatus("");
          onHideSecurityChoice?.();
          onSuccess();
        } else {
          setError("Password URL is missing. Please try again.");
        }
      }
    } catch (err) {
      console.error("[PhoneAuth] Security setup error", err);
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
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+1234567890"
            keyboardType="phone-pad"
          />
          <Text style={styles.hint}>
            Include country code (e.g., +1 for US)
          </Text>
          <Button title="Continue" onPress={handleContinue} loading={loading} />
        </>
      ) : showVerification ? (
        <>
          <Text style={styles.subtitle}>
            Enter verification code sent to {phone}
          </Text>
          <Input
            label="Verification Code"
            value={verificationCode}
            onChangeText={(text) => setVerificationCode(text.slice(0, 6))}
            placeholder="Enter 6-digit code"
            keyboardType="number-pad"
            maxLength={6}
          />

          {phone.includes("555") && (
            <View style={styles.betaReminder}>
              <Text style={styles.betaReminderText}>
                <Text style={styles.betaBold}>Beta Testing:</Text> Any random
                OTP will work
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
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  hint: {
    fontSize: 12,
    color: "#666",
    marginBottom: 16,
    marginTop: -8,
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
