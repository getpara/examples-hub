import React from 'react';
import Animated from 'react-native-reanimated';
import { Text } from '@/components/ui/text';

interface AnimatedTextProps {
  children: React.ReactNode;
  className?: string;
  animatedStyle?: any;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  className,
  animatedStyle,
}) => {
  return (
    <Animated.View style={animatedStyle}>
      <Text className={className}>{children}</Text>
    </Animated.View>
  );
};