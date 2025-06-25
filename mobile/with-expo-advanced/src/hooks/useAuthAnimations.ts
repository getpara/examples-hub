import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';

export const useAuthAnimations = () => {
  // Shared values for each animated element
  const logoAnim = useSharedValue(0);
  const headingAnim = useSharedValue(0);
  const subtitleAnim = useSharedValue(0);
  const inputAnim = useSharedValue(0);
  const separatorAnim = useSharedValue(0);
  const socialButtonsAnim = useSharedValue(0);
  const footerAnim = useSharedValue(0);

  // Loading and error states
  const isLoading = useSharedValue(false);
  const hasError = useSharedValue(false);

  // Initialize animations on mount
  useEffect(() => {
    // Unified spring config for consistent physics
    const springConfig = {
      damping: 22,
      stiffness: 260,
      mass: 0.8,
    };

    // Natural stagger with exponential decay
    logoAnim.value = withDelay(0, withSpring(1, springConfig));
    headingAnim.value = withDelay(50, withSpring(1, springConfig));
    subtitleAnim.value = withDelay(80, withSpring(1, springConfig));
    inputAnim.value = withDelay(100, withSpring(1, springConfig));
    separatorAnim.value = withDelay(115, withSpring(1, springConfig));
    socialButtonsAnim.value = withDelay(125, withSpring(1, springConfig));
    footerAnim.value = withDelay(130, withSpring(1, springConfig));
  }, []);

  // Logo animation style
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoAnim.value,
    transform: [
      {
        translateY: interpolate(logoAnim.value, [0, 1], [12, 0]),
      },
      {
        scale: interpolate(logoAnim.value, [0, 1], [0.98, 1]),
      },
    ],
  }));

  // Heading animation style
  const headingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headingAnim.value,
    transform: [
      {
        translateY: interpolate(headingAnim.value, [0, 1], [15, 0]),
      },
      {
        scale: interpolate(headingAnim.value, [0, 1], [0.98, 1]),
      },
    ],
  }));

  // Subtitle animation style
  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleAnim.value,
    transform: [
      {
        translateY: interpolate(subtitleAnim.value, [0, 1], [10, 0]),
      },
    ],
  }));

  // Input animation style
  const inputAnimatedStyle = useAnimatedStyle(() => ({
    opacity: inputAnim.value,
    transform: [
      {
        translateY: interpolate(inputAnim.value, [0, 1], [12, 0]),
      },
      {
        scale: interpolate(inputAnim.value, [0, 1], [0.98, 1]),
      },
    ],
  }));

  // Separator animation style
  const separatorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: separatorAnim.value,
    transform: [
      {
        scaleX: interpolate(separatorAnim.value, [0, 0.3, 1], [0, 0.1, 1]),
      },
    ],
  }));

  // Social buttons container animation style
  const socialButtonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: socialButtonsAnim.value,
    transform: [
      {
        translateY: interpolate(socialButtonsAnim.value, [0, 1], [10, 0]),
      },
    ],
  }));

  // Footer animation style
  const footerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: footerAnim.value,
    transform: [
      {
        translateY: interpolate(footerAnim.value, [0, 1], [8, 0]),
      },
    ],
  }));

  // Function to create staggered button animation
  const createButtonAnimation = (index: number) => {
    const buttonAnim = useSharedValue(0);
    
    useEffect(() => {
      buttonAnim.value = withDelay(
        500 + index * 50,
        withSpring(1, { damping: 10 })
      );
    }, []);

    return useAnimatedStyle(() => ({
      opacity: buttonAnim.value,
      transform: [
        {
          scale: interpolate(buttonAnim.value, [0, 1], [0.8, 1]),
        },
      ],
    }));
  };

  // Loading state handler
  const setLoadingState = (loading: boolean) => {
    'worklet';
    isLoading.value = loading;
  };

  // Error shake animation
  const triggerErrorShake = () => {
    hasError.value = true;
    setTimeout(() => {
      hasError.value = false;
    }, 200);
  };

  return {
    logoAnimatedStyle,
    headingAnimatedStyle,
    subtitleAnimatedStyle,
    inputAnimatedStyle,
    separatorAnimatedStyle,
    socialButtonsAnimatedStyle,
    footerAnimatedStyle,
    createButtonAnimation,
    setLoadingState,
    triggerErrorShake,
    isLoading,
    hasError,
  };
};