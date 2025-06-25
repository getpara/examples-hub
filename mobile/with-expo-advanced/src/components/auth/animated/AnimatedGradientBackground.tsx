import React, { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import {
  Canvas,
  Rect,
  Fill,
  Paint,
  FractalNoise,
  LinearGradient,
  vec,
  ColorMatrix,
  BlendMode,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export const AnimatedGradientBackground: React.FC = () => {
  // Animation values for wave movement
  const waveProgress = useSharedValue(0);
  const seedProgress = useSharedValue(0);

  // Start animations on mount
  useEffect(() => {
    // Animate wave parameters for organic movement
    waveProgress.value = withRepeat(
      withTiming(1, {
        duration: 30000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Animate seed for subtle pattern changes
    seedProgress.value = withRepeat(
      withTiming(100, {
        duration: 60000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  // Animate frequency for breathing effect
  const freqX = useDerivedValue(() => {
    return interpolate(waveProgress.value, [0, 1], [0.003, 0.005]);
  });

  const freqY = useDerivedValue(() => {
    return interpolate(waveProgress.value, [0, 1], [0.002, 0.004]);
  });

  // Color matrix to map noise to our color palette
  // This creates the depth effect: dark valleys to light peaks
  const colorMatrix = [
    // R' = noise * 0.15 (slight red for highlights)
    0.15, 0, 0, 0, 0.04,
    // G' = noise * 0.12 (less green)
    0, 0.12, 0, 0, 0.035,
    // B' = noise * 0.18 (more blue for depth)
    0, 0, 0.18, 0, 0.05,
    // A' = 1 (full opacity)
    0, 0, 0, 1, 0,
  ];

  return (
    <Canvas style={StyleSheet.absoluteFillObject}>
      {/* Base background */}
      <Fill color="#0b090d" />

      {/* Main wave layer with fractal noise */}
      <Paint opacity={0.8}>
        <ColorMatrix matrix={colorMatrix} />
        <FractalNoise
          freqX={freqX}
          freqY={freqY}
          octaves={4}
          seed={seedProgress}
          tileWidth={0}
          tileHeight={0}
        />
      </Paint>
      <Rect x={0} y={0} width={width} height={height} />

      {/* Secondary wave layer for more complexity */}
      <Paint opacity={0.4}>
        <ColorMatrix matrix={colorMatrix} />
        <FractalNoise
          freqX={0.008}
          freqY={0.006}
          octaves={2}
          seed={seedProgress}
          tileWidth={0}
          tileHeight={0}
        />
      </Paint>
      <Rect x={0} y={0} width={width} height={height} />

      {/* Subtle gradient overlay for silk-like sheen */}
      <Rect x={0} y={0} width={width} height={height} opacity={0.2}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={[
            'rgba(255, 78, 0, 0.1)',  // Very subtle orange
            'rgba(32, 28, 39, 0.3)',  // Purple-gray
            'rgba(255, 78, 0, 0.05)', // Faint orange
          ]}
          positions={[0, 0.5, 1]}
        />
      </Rect>
    </Canvas>
  );
};