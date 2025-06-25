import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';

interface AnimatedSeparatorProps {
  text: string;
  separatorAnimatedStyle?: any;
  textAnimatedStyle?: any;
}

export const AnimatedSeparator: React.FC<AnimatedSeparatorProps> = ({
  text,
  separatorAnimatedStyle,
  textAnimatedStyle,
}) => {
  return (
    <Animated.View style={separatorAnimatedStyle} className="flex-row items-center gap-x-2 py-2">
      <View style={{ flex: 1 }}>
        <Separator />
      </View>
      <Animated.View style={textAnimatedStyle}>
        <Text className="text-center text-sm text-muted-foreground">{text}</Text>
      </Animated.View>
      <View style={{ flex: 1 }}>
        <Separator />
      </View>
    </Animated.View>
  );
};