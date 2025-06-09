import { useRef } from "react";
import { useEffect } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { OTPInput } from "input-otp-native";
import type { OTPInputRef, SlotProps } from "input-otp-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface VerificationCodeInputProps {
  maxLength?: number;
  onComplete: (code: string) => void;
  onClear?: () => void;
  slotClassName?: string;
  activeSlotClassName?: string;
  slotSize?: number;
  slotTextClassName?: string;
  caretColor?: string;
  caretHeight?: number;
  caretWidth?: number;
  gap?: number;
  autoComplete?: boolean;
}

export function VerificationCodeInput({
  maxLength = 5,
  onComplete,
  slotClassName = "border border-gray-200 rounded-lg bg-white",
  activeSlotClassName = "border-black border-2",
  slotSize = 50,
  slotTextClassName = "text-2xl font-medium text-gray-900",
  caretColor = "#000",
  caretHeight = 28,
  caretWidth = 2,
  autoComplete = true,
}: VerificationCodeInputProps) {
  const ref = useRef<OTPInputRef>(null);

  const handleComplete = (code: string) => {
    onComplete(code);
    if (autoComplete) {
      ref.current?.clear();
    }
  };

  return (
    <OTPInput
      ref={ref}
      onComplete={handleComplete}
      maxLength={maxLength}
      render={({ slots }) => (
        <View className={`flex-row items-center justify-between my-4`}>
          {slots.map((slot, idx) => (
            <Slot
              key={idx}
              {...slot}
              slotClassName={slotClassName}
              activeSlotClassName={activeSlotClassName}
              slotSize={slotSize}
              slotTextClassName={slotTextClassName}
              caretColor={caretColor}
              caretHeight={caretHeight}
              caretWidth={caretWidth}
            />
          ))}
        </View>
      )}
    />
  );
}

export interface SlotComponentProps extends SlotProps {
  slotClassName?: string;
  activeSlotClassName?: string;
  slotSize?: number;
  slotTextClassName?: string;
  caretColor?: string;
  caretHeight?: number;
  caretWidth?: number;
}

function Slot({
  char,
  isActive,
  hasFakeCaret,
  slotClassName = "border border-border rounded-lg bg-white",
  activeSlotClassName = "border-black border-2",
  slotSize = 48,
  slotTextClassName = "text-2xl font-medium text-gray-900",
  caretColor = "#000",
  caretHeight = 28,
  caretWidth = 2,
}: SlotComponentProps) {
  return (
    <View
      className={cn(slotClassName, {
        [activeSlotClassName]: isActive,
      })}
      style={{ width: slotSize, height: slotSize }}>
      <View className="w-full h-full items-center justify-center">
        {char !== null && <Text className={slotTextClassName}>{char}</Text>}
        {hasFakeCaret && (
          <FakeCaret
            color={caretColor}
            height={caretHeight}
            width={caretWidth}
          />
        )}
      </View>
    </View>
  );
}

export interface FakeCaretProps {
  color?: string;
  height?: number;
  width?: number;
}

function FakeCaret({ color = "#000", height = 28, width = 2 }: FakeCaretProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0, { duration: 500 }), withTiming(1, { duration: 500 })),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const baseStyle = {
    width,
    height,
    backgroundColor: color,
    borderRadius: width / 2,
  };

  return (
    <View className="absolute w-full h-full items-center justify-center">
      <Animated.View style={[baseStyle, animatedStyle]} />
    </View>
  );
}
