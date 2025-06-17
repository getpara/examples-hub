import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '~/components/ui/text';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = '#6366f1',
  text,
  className = '',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinnerSize = size === 'small' ? 'small' : 'large';

  const content = (
    <>
      <ActivityIndicator size={spinnerSize} color={color} />
      {text && (
        <Text className="mt-2 text-center text-muted-foreground">{text}</Text>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <View className={`flex-1 items-center justify-center ${className}`}>
        {content}
      </View>
    );
  }

  return (
    <View className={`items-center justify-center py-4 ${className}`}>
      {content}
    </View>
  );
}
