import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

interface LoadingIndicatorProps {
  title?: string;
  subtitle?: string;
  color?: string;
  size?: "small" | "large" | number;
}

export function LoadingIndicator({
  title = "Loading",
  subtitle,
  color = "#0000ff",
  size = "large",
}: LoadingIndicatorProps) {
  return (
    <View className="flex-1 justify-center items-center p-5">
      <ActivityIndicator
        size={size}
        color={color}
      />
      {title && <Text className="text-lg font-bold mt-3 text-center">{title}</Text>}
      {subtitle && <Text className="text-base mt-2 text-center opacity-70">{subtitle}</Text>}
    </View>
  );
}

export default LoadingIndicator;
