import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { para } from "../para";
import { Input } from "./common/Input";
import { Button } from "./common/Button";
import { StatusDisplay } from "./common/StatusDisplay";

interface EmailAuthProps {
  onSuccess: () => void;
}

export const EmailAuth: React.FC<EmailAuthProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!email) {
      setError("Please enter an email");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("Checking email...");

    try {
      // Call signUpOrLogIn to determine if user exists
      const authState = await para.signUpOrLogIn({ auth: { email } });

      if (authState?.stage === "verify") {
        // New user - show OTP verification
        setShowVerification(true);
        setStatus("Verification code sent to your email");
      } else if (authState?.stage === "login") {
        // Existing user - proceed with passkey login
        setStatus("Logging in with passkey...");
        await para.loginWithPasskey();
        setStatus("");
        onSuccess();
      }
    } catch (err) {
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
      // Verify the OTP code
      const authState = await para.verifyNewAccount({ verificationCode });

      // Register passkey for new user
      setStatus("Creating passkey...");
      await para.registerPasskey(authState);

      setStatus("");
      onSuccess();
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Authentication</Text>

      {!showVerification ? (
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
      ) : (
        <>
          <Text style={styles.subtitle}>Enter verification code sent to {email}</Text>
          <Input
            label="Verification Code"
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="Enter 6-digit code"
            keyboardType="number-pad"
          />
          <Button
            title="Verify"
            onPress={handleVerification}
            loading={loading}
          />
          <Button
            title="Resend Code"
            onPress={resendCode}
            variant="secondary"
            disabled={loading}
          />
        </>
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
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
});
