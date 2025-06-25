import React, { useState, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Grip, X } from '@/components/icons';
import { SocialLoginProvidersMap } from '@/types';
import { generateProviderRows } from '@/utils/socialLoginUtils';
import { OAuthMethod } from '@getpara/react-native-wallet';
import { AnimatedSocialButton } from './AnimatedSocialButton';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedSocialLoginOptionsProps {
  initialProviders: OAuthMethod[];
  additionalProviders: OAuthMethod[];
  providerInfo: SocialLoginProvidersMap;
  maxProvidersPerRow: number;
  onSelect(provider: OAuthMethod): void;
  disabled?: boolean;
  excludeProviders?: OAuthMethod[];
  containerAnimatedStyle?: any;
}

export function AnimatedSocialLoginOptions({
  initialProviders,
  additionalProviders,
  providerInfo,
  maxProvidersPerRow,
  onSelect,
  disabled,
  excludeProviders = [],
  containerAnimatedStyle,
}: AnimatedSocialLoginOptionsProps) {
  const [expanded, setExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const toggleScale = useSharedValue(1);
  const toggleRotation = useSharedValue(0);
  const toggleWidth = useSharedValue(1); // For animating toggle width in first row
  const toggleOpacityInFirst = useSharedValue(1);
  const toggleOpacityInLast = useSharedValue(0);
  const expandAnimation = useSharedValue(0);
  
  // Shared values for first row button widths
  const firstRowButtonWidths = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];

  // Calculate providers
  const initialFilteredProviders = initialProviders.filter(
    (provider) => !excludeProviders.includes(provider)
  );
  
  const additionalFilteredProviders = additionalProviders.filter(
    (provider) => !excludeProviders.includes(provider)
  );
  
  const allFilteredProviders = [...initialFilteredProviders, ...additionalFilteredProviders];

  // Determine which providers to show based on state
  const visibleProviders = (expanded || isAnimating) ? allFilteredProviders : initialFilteredProviders;

  // Handle expand/collapse animation
  useEffect(() => {
    expandAnimation.value = withTiming(expanded ? 1 : 0, { duration: 300 });
  }, [expanded]);

  const handleTogglePress = () => {
    const willExpand = !expanded;
    
    // Start animating
    setIsAnimating(true);
    
    // Update expanded state
    setExpanded(willExpand);
    
    // Animate all elements concurrently (all 300ms with same easing)
    const springConfig = { damping: 20, stiffness: 300 };
    const timingConfig = { duration: 300, easing: Easing.inOut(Easing.ease) };
    
    // Toggle button press feedback
    toggleScale.value = withSpring(0.95, springConfig);
    setTimeout(() => {
      toggleScale.value = withSpring(1, springConfig);
    }, 100);
    
    // Icon rotation
    toggleRotation.value = withTiming(willExpand ? 180 : 0, timingConfig);
    expandAnimation.value = withTiming(willExpand ? 1 : 0, timingConfig);
    
    // Animate toggle and buttons together
    if (willExpand) {
      // Expanding: simultaneous animations
      toggleWidth.value = withTiming(0, timingConfig);
      toggleOpacityInFirst.value = withTiming(0, { duration: 200 });
      toggleOpacityInLast.value = withTiming(1, { duration: 200 });
      
      // Animate first row buttons to expand
      firstRowButtonWidths.forEach((width) => {
        width.value = withTiming(1, timingConfig);
      });
    } else {
      // Collapsing: simultaneous animations
      toggleOpacityInLast.value = withTiming(0, { duration: 200 });
      toggleWidth.value = withTiming(1, timingConfig);
      toggleOpacityInFirst.value = withTiming(1, { duration: 200 });
      
      // Animate first row buttons to shrink
      firstRowButtonWidths.forEach((width) => {
        width.value = withTiming(0, timingConfig);
      });
    }
    
    // End animation state after animations complete
    setTimeout(() => {
      setIsAnimating(false);
    }, 350);
  };

  const toggleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: toggleScale.value },
      { rotate: `${toggleRotation.value}deg` },
    ],
  }));

  // Calculate provider lists
  const firstRowProviders = initialFilteredProviders.slice(0, 3);
  const additionalProvidersToShow = visibleProviders.slice(3);

  const renderProvider = (provider: OAuthMethod, index: number, rowIndex: number, isFirstRow: boolean) => {
    const info = providerInfo[provider];
    if (!info) return null;

    // Determine if this is a new button (not in initial providers)
    const isNewButton = !initialFilteredProviders.includes(provider);

    return (
      <AnimatedSocialButtonWithStagger
        key={provider}
        logo={info.logo}
        name={info.name}
        index={index}
        rowIndex={rowIndex}
        isFirstRowButton={isFirstRow}
        expanded={expanded}
        isNewButton={isNewButton}
        totalNewButtons={additionalFilteredProviders.length}
        isAnimating={isAnimating}
        widthAnimation={isFirstRow && index < 3 ? firstRowButtonWidths[index] : undefined}
        onPress={() => onSelect(provider)}
        disabled={disabled}
      />
    );
  };
  const toggleInFirstRowStyle = useAnimatedStyle(() => {
    // Use flex but with maxWidth to properly collapse
    return {
      flex: toggleWidth.value,
      maxWidth: interpolate(toggleWidth.value, [0, 1], [0, 999]),
      opacity: toggleOpacityInFirst.value,
      overflow: 'hidden' as const,
    };
  });
  
  const toggleInLastRowStyle = useAnimatedStyle(() => {
    return {
      flex: 1,
      opacity: toggleOpacityInLast.value,
    };
  });

  const renderToggleInFirstRow = () => {
    return (
      <Animated.View style={toggleInFirstRowStyle}>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Show more options"
          onPress={handleTogglePress}
          className="h-14 items-center justify-center rounded-xl
                     border border-border bg-card
                     active:opacity-80"
          style={toggleAnimatedStyle}
        >
          <Grip size={24} className="text-muted-foreground" />
        </AnimatedPressable>
      </Animated.View>
    );
  };

  const renderToggleInLastRow = () => {
    if (!expanded && !isAnimating) return null;
    
    return (
      <Animated.View style={toggleInLastRowStyle}>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Show fewer options"
          onPress={handleTogglePress}
          className="h-14 items-center justify-center rounded-xl
                     border border-border bg-card
                     active:opacity-80"
          style={toggleAnimatedStyle}
        >
          <X size={24} className="text-muted-foreground" />
        </AnimatedPressable>
      </Animated.View>
    );
  };
  return (
    <Animated.View style={containerAnimatedStyle}>
      <View className="gap-y-2">
        {/* First row - always contains first 3 providers + toggle */}
        <View className="flex-row gap-x-2">
          {firstRowProviders.map((provider, idx) => 
            renderProvider(provider, idx, 0, true)
          )}
          {renderToggleInFirstRow()}
        </View>
        
        {/* Additional providers - only rendered when expanded or animating */}
        {additionalProvidersToShow.length > 0 && (
          <View className="flex-row gap-x-2 flex-wrap">
            {additionalProvidersToShow.map((provider, idx) => 
              renderProvider(provider, idx + 3, 1, false)
            )}
            {renderToggleInLastRow()}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// Separate component to handle individual button animations
function AnimatedSocialButtonWithStagger({
  logo,
  name,
  index,
  rowIndex,
  isFirstRowButton,
  expanded,
  isNewButton,
  totalNewButtons,
  isAnimating,
  widthAnimation,
  onPress,
  disabled,
}: {
  logo: any;
  name: string;
  index: number;
  rowIndex: number;
  isFirstRowButton: boolean;
  expanded: boolean;
  isNewButton: boolean;
  totalNewButtons: number;
  isAnimating: boolean;
  widthAnimation?: Animated.SharedValue<number>;
  onPress: () => void;
  disabled?: boolean;
}) {
  const animValue = useSharedValue(0);

  useEffect(() => {
    // Handle opacity animations for new buttons
    if (isNewButton) {
      if (expanded) {
        // Fade in new buttons with delay
        animValue.value = withDelay(
          (index - 3) * 40, // Slightly faster stagger
          withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) })
        );
      } else {
        // Fade out all at once for cleaner collapse
        animValue.value = withTiming(0, { 
          duration: 200, 
          easing: Easing.in(Easing.ease) 
        });
      }
    } else {
      // Initial buttons are always visible
      animValue.value = 1;
    }
  }, [expanded, isNewButton, index]);

  // Remove the width animation effect since we're now using the shared value from parent

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animValue.value,
    transform: [
      {
        scale: interpolate(animValue.value, [0, 1], [0.8, 1]),
      },
    ],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => {
    // For first row buttons that need to animate width
    if (isFirstRowButton && widthAnimation) {
      // When collapsed: 4 items share space (3 buttons + 1 toggle)
      // When expanded: 3 items take full space
      // So each button goes from flex: 1 to flex: 1.333
      const flexValue = interpolate(
        widthAnimation.value,
        [0, 1],
        [1, 1.333] // 1 * (4/3) = 1.333
      );
      
      return {
        flex: flexValue,
      };
    }
    
    // Other buttons just use flex: 1
    return {
      flex: 1,
    };
  });

  return (
    <Animated.View style={containerAnimatedStyle}>
      <AnimatedSocialButton
        logo={logo}
        name={name}
        index={index}
        containerAnimatedStyle={animatedStyle}
        onPress={onPress}
        disabled={disabled}
      />
    </Animated.View>
  );
}