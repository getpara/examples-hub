import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Input, Button, Text } from "@rneui/themed";
import { randomTestOTP } from "@/util/random";

interface OTPVerificationProps {
  onVerify: (code: string) => Promise<void>;
  resendOTP: () => Promise<void>;
}

export default function OTPVerificationComponent({ onVerify, resendOTP }: OTPVerificationProps) {
  const [otp, setOtp] = useState(randomTestOTP());
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setIsVerifying(true);
    setError("");
    try {
      await onVerify(otp);
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    }
    setIsVerifying(false);
  };

  const handleResend = async () => {
    try {
      await resendOTP();
      setError("");
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <View>
      <Input
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        containerStyle={styles.inputContainer}
        inputContainerStyle={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        title="Verify OTP"
        onPress={handleVerify}
        disabled={otp.length !== 6 || isVerifying}
        loading={isVerifying}
        buttonStyle={styles.button}
        containerStyle={styles.buttonContainer}
      />
      <Button
        title="Resend OTP"
        onPress={handleResend}
        type="clear"
        containerStyle={styles.resendButton}
        titleStyle={styles.resendButtonText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 22,
    marginBottom: 24,
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  error: {
    color: "#dc3545",
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#ff3c22",
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonContainer: {
    width: "100%",
  },
  resendButton: {
    marginTop: 16,
  },
  resendButtonText: {
    color: "#ff3c22",
    fontSize: 14,
  },
});
