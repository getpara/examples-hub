import React, { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SLOTS = {
  LEFT: "left",
  CENTER: "center",
  RIGHT: "right",
} as const;

interface SlotProps {
  children: ReactNode;
  key?: string | number;
}

type AppHeaderCompound = {
  Left: React.FC<SlotProps>;
  Center: React.FC<SlotProps>;
  Right: React.FC<SlotProps>;
};

export const AppHeader: React.FC<{
  children: ReactNode;
}> &
  AppHeaderCompound = ({ children }) => {
  const { top } = useSafeAreaInsets();

  const seenSlots = React.useRef<Record<string, boolean>>({}).current;

  if (__DEV__) {
    for (const key in seenSlots) {
      seenSlots[key] = false;
    }
  }

  let leftSlot: ReactNode = null;
  let centerSlot: ReactNode = null;
  let rightSlot: ReactNode = null;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    const childType = child.type as any;

    if (childType.__slot === SLOTS.LEFT) {
      if (__DEV__ && seenSlots[SLOTS.LEFT]) {
        console.warn("Multiple AppHeader.Left components detected. Only the last one will be rendered.");
      }
      seenSlots[SLOTS.LEFT] = true;
      leftSlot = (child.props as SlotProps).children;
    } else if (childType.__slot === SLOTS.CENTER) {
      if (__DEV__ && seenSlots[SLOTS.CENTER]) {
        console.warn("Multiple AppHeader.Center components detected. Only the last one will be rendered.");
      }
      seenSlots[SLOTS.CENTER] = true;
      centerSlot = (child.props as SlotProps).children;
    } else if (childType.__slot === SLOTS.RIGHT) {
      if (__DEV__ && seenSlots[SLOTS.RIGHT]) {
        console.warn("Multiple AppHeader.Right components detected. Only the last one will be rendered.");
      }
      seenSlots[SLOTS.RIGHT] = true;
      rightSlot = (child.props as SlotProps).children;
    }
  });

  return (
    <View className="bg-background px-6">
      <View className="flex-row items-center justify-between">
        <View className="flex-shrink-0">{leftSlot}</View>
        <View className="px-2 mx-auto">{centerSlot}</View>
        <View className="flex-shrink-0">{rightSlot}</View>
      </View>
    </View>
  );
};

const Left: React.FC<SlotProps> = ({ children }) => null;
Left.displayName = "AppHeader.Left";
(Left as any).__slot = SLOTS.LEFT;

const Center: React.FC<SlotProps> = ({ children }) => null;
Center.displayName = "AppHeader.Center";
(Center as any).__slot = SLOTS.CENTER;

const Right: React.FC<SlotProps> = ({ children }) => null;
Right.displayName = "AppHeader.Right";
(Right as any).__slot = SLOTS.RIGHT;

AppHeader.Left = Left;
AppHeader.Center = Center;
AppHeader.Right = Right;
