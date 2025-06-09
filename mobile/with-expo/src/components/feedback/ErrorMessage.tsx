import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { AlertCircle, AlertTriangle, Info, XCircle } from "@/components/icons";

type ErrorType = "error" | "warning" | "info" | "destructive";

interface ErrorMessageProps {
  message: string;
  type?: ErrorType;
  title?: string;
  className?: string;
}

export function ErrorMessage({ 
  message, 
  type = "error", 
  title,
  className = "" 
}: ErrorMessageProps) {
  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle size={18} className="text-yellow-600" />;
      case "info":
        return <Info size={18} className="text-blue-600" />;
      case "destructive":
        return <XCircle size={18} className="text-destructive" />;
      default:
        return <AlertCircle size={18} className="text-destructive" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      case "destructive":
        return "bg-destructive/10 border-destructive/20";
      default:
        return "bg-destructive/10 border-destructive/20";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "warning":
        return "text-yellow-900";
      case "info":
        return "text-blue-900";
      default:
        return "text-destructive";
    }
  };

  return (
    <View className={`flex-row items-start gap-x-2 rounded-lg border p-3 ${getStyles()} ${className}`}>
      <View className="mt-0.5">{getIcon()}</View>
      <View className="flex-1">
        {title && (
          <Text className={`text-sm font-medium mb-1 ${getTextColor()}`}>
            {title}
          </Text>
        )}
        <Text className={`text-sm ${getTextColor()}`}>{message}</Text>
      </View>
    </View>
  );
}