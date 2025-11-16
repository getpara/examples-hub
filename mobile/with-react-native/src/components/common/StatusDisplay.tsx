import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StatusDisplayProps {
  status?: string;
  error?: string;
  success?: string;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, error, success }) => {
  // Only render if there's a message to display
  if (!status && !error && !success) return null;

  return (
    <View
      style={[
        styles.container,
        error && styles.errorContainer,
        success && styles.successContainer,
        !error && !success && styles.infoContainer,
      ]}>
      <Text
        style={[
          styles.text,
          error && styles.errorText,
          success && styles.successText,
          !error && !success && styles.infoText,
        ]}>
        {/* Priority: error > success > status */}
        {error || success || status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 4,
    marginVertical: 8,
    borderWidth: 1,
  },
  infoContainer: {
    backgroundColor: "#F8F8F8",
    borderColor: "#E5E5E5",
  },
  errorContainer: {
    backgroundColor: "#FFFFFF",
    borderColor: "#000000",
    borderWidth: 2,
  },
  successContainer: {
    backgroundColor: "#F8F8F8",
    borderColor: "#666666",
  },
  text: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  infoText: {
    color: "#666666",
  },
  errorText: {
    color: "#000000",
  },
  successText: {
    color: "#000000",
  },
});