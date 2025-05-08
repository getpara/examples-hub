import React from "react";
import { View, Text, Pressable } from "react-native";

interface ErrorIndicatorProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  errorColor?: string;
}

export function ErrorIndicator({
  title = "Error",
  message,
  actionText = "Try Again",
  onAction,
  errorColor = "#FF3B30",
}: ErrorIndicatorProps) {
  return (
    <View className="flex-1 justify-center items-center p-5">
      <Text
        className="text-lg font-bold mb-3 text-center"
        style={{ color: errorColor }}>
        {title}
      </Text>

      {message && <Text className="text-base text-center mb-5">{message}</Text>}

      {onAction && (
        <Pressable
          className="py-3 px-5 rounded-lg mt-3 border"
          style={{ borderColor: errorColor }}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionText}>
          <Text
            className="text-base font-bold"
            style={{ color: errorColor }}>
            {actionText}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export default ErrorIndicator;
