import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Mail, ChevronRight, AlertCircle } from '@/components/icons';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { CountryCodeDropdown } from '../CountryCodeDropdown';
import { AuthType, CountryOption } from '@/types';

interface AnimatedLoginInputProps {
  displayValue: string;
  inputType: AuthType;
  countryCode: string;
  error: string;
  isValid: boolean;
  showHelperText: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCountryCodeChange: (value: string) => void;
  countryOptions: CountryOption[];
  placeholder?: string;
  label?: string;
  isLoading?: boolean;
  animatedStyle?: any;
}

export const AnimatedLoginInput: React.FC<AnimatedLoginInputProps> = ({
  displayValue,
  inputType,
  countryCode,
  error,
  isValid,
  showHelperText,
  onChange,
  onSubmit,
  onCountryCodeChange,
  countryOptions,
  placeholder = 'Enter email or phone number',
  label = 'Email or phone number',
  isLoading = false,
  animatedStyle,
}) => {
  const [currentIcon, setCurrentIcon] = useState(inputType);
  const iconSlideX = useSharedValue(0);
  const iconOpacity = useSharedValue(1);


  // Handle input type change animation
  useEffect(() => {
    if (inputType && inputType !== currentIcon) {
      // Slide out current icon to the right
      iconSlideX.value = withTiming(30, { duration: 150 });
      iconOpacity.value = withTiming(0, { duration: 150 }, () => {
        // Update icon
        runOnJS(setCurrentIcon)(inputType);
        // Slide in new icon from left
        iconSlideX.value = -30;
        iconSlideX.value = withTiming(0, { duration: 150 });
        iconOpacity.value = withTiming(1, { duration: 150 });
      });
    }
  }, [inputType]);


  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: iconSlideX.value },
    ],
    opacity: iconOpacity.value,
  }));


  return (
    <Animated.View style={animatedStyle} className="gap-y-2">
        <Text
          accessibilityRole="text"
          className="text-base font-medium text-foreground native:text-lg"
        >
          {label}
        </Text>
        <View className="relative">
          <View className="flex-row h-14 rounded-lg border border-border bg-card items-center">
            <Animated.View 
              className="h-full w-16 flex items-center justify-center border-r border-border overflow-hidden"
            >
              <Animated.View style={iconAnimatedStyle}>
                {currentIcon === 'email' ? (
                  <Mail size={24} className="text-muted-foreground" />
                ) : currentIcon === 'phone' ? (
                  <CountryCodeDropdown
                    value={countryCode}
                    onChange={onCountryCodeChange}
                    countryOptions={countryOptions}
                  />
                ) : null}
              </Animated.View>
            </Animated.View>

            <Input
              value={displayValue}
              onChangeText={onChange}
              placeholder={placeholder}
              keyboardType={inputType === 'phone' ? 'phone-pad' : 'default'}
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 h-14 text-base text-foreground border-0 bg-transparent font-nunito"
              placeholderTextColor="#505055"
            />

            <View className="flex h-full items-center justify-center pr-4">
              <Button
                size="icon"
                variant="default"
                onPress={onSubmit}
                accessibilityLabel="Continue"
                disabled={isLoading || !isValid}
                className="flex h-9 w-9 items-center justify-center rounded-md bg-primary p-0"
              >
                <ChevronRight size={18} className="text-primary-foreground" />
              </Button>
            </View>
          </View>
        </View>

        {showHelperText && (
          <Text className="pl-2 text-xs text-muted-foreground">
            {inputType === 'phone'
              ? `Continuing with phone (${countryCode})`
              : `Continuing with ${inputType}`}
          </Text>
        )}

        {error !== '' && (
          <View className="mt-1 flex-row items-start gap-x-2 rounded-lg bg-destructive/10 p-3">
            <AlertCircle size={18} className="mt-1 text-destructive" />
            <Text className="flex-1 text-sm text-destructive">{error}</Text>
          </View>
        )}
    </Animated.View>
  );
};