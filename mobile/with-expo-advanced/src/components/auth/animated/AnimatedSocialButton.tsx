import React from 'react';
import { Image, Pressable, PressableProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  useAnimatedProps,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedSocialButtonProps extends PressableProps {
  logo: any;
  name: string;
  index: number;
  containerAnimatedStyle?: any;
}

export const AnimatedSocialButton: React.FC<AnimatedSocialButtonProps> = ({
  logo,
  name,
  index,
  containerAnimatedStyle,
  onPress,
  disabled,
  ...props
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const isPressed = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
    rotation.value = withSpring(5, { damping: 15 });
    isPressed.value = withTiming(1, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    rotation.value = withSpring(0, { damping: 15 });
    isPressed.value = withTiming(0, { duration: 100 });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
    ],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ff4e00',
    opacity: interpolate(isPressed.value, [0, 1], [0, 0.2]),
  }));

  // Animate the flex property for smooth width transitions
  const animatedProps = useAnimatedProps(() => {
    return {
      style: {
        flex: 1,
      },
    };
  });

  return (
    <Animated.View style={[containerAnimatedStyle, buttonAnimatedStyle]}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={`Sign in with ${name}`}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        className="h-14 items-center justify-center rounded-xl
                   border border-border bg-card
                   active:opacity-80"
        animatedProps={animatedProps}
        {...props}
      >
        <Animated.View style={glowAnimatedStyle} />
        <Animated.View style={logoAnimatedStyle}>
          <Image source={logo} resizeMode="contain" className="h-7 w-7" />
        </Animated.View>
      </AnimatedPressable>
    </Animated.View>
  );
};