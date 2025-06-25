import React from 'react';
import { Image, ImageProps } from 'react-native';
import Animated from 'react-native-reanimated';

interface AnimatedLogoProps extends Omit<ImageProps, 'source'> {
  source: any;
  animatedStyle?: any;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  source,
  animatedStyle,
  ...props
}) => {
  return (
    <Animated.View style={animatedStyle}>
      <Image source={source} {...props} />
    </Animated.View>
  );
};