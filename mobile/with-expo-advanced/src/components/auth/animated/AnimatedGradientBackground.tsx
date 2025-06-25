import React, { useMemo, useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Canvas, Fill, Skia, Shader } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Custom gradient noise shader
const whiteNoiseShader = `
uniform vec2 u_resolution;
uniform float u_time;

float random(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 main(vec2 fragCoord) {
  vec2 uv = fragCoord / u_resolution;
  
  // Scale UV for larger, sparser grain
  vec2 scaledUV = uv * 60.0;
  
  // Generate noise
  float noise = random(scaledUV);
  
  // Animate center in elliptical pattern
  float ellipseX = 0.45 + sin(u_time) * 0.3; // Slow horizontal movement
  float ellipseY = 0.35 + cos(u_time) * 0.15;  // Slow vertical movement
  vec2 center = vec2(ellipseX, ellipseY);
  
  float dist = distance(uv, center);
  float gradient = 1.0 - smoothstep(0.0, 0.75, dist);
  
  // Apply gradient to noise intensity - subtle effect
  float gradientNoise = mix(0.0, noise, gradient * 0.8);
  
  // Base color (dark) + orange-tinted noise
  vec3 baseColor = vec3(0.043, 0.035, 0.051); // Your background color
  vec3 primaryColor = vec3(1.0, 0.31, 0.0); // Orange primary color
  
  // Mix base color with orange based on noise gradient - subtle blend
  vec3 color = mix(baseColor, baseColor + primaryColor * 0.6, gradientNoise);

  return vec4(color, 1.0);
}
`;

export const AnimatedGradientBackground: React.FC = () => {
  // Animation value for elliptical movement
  const time = useSharedValue(0);

  // Start animation with continuous linear progression
  useEffect(() => {
    // Use a large value that will take a very long time to reach
    // This avoids the jump when resetting from 2π to 0
    time.value = withTiming(Math.PI * 2 * 1000, {
      duration: 20000 * 1000, // 20 seconds per rotation, 1000 rotations
      easing: Easing.linear,
    });
  }, []);

  // Create runtime effect
  const runtimeEffect = useMemo(() => {
    try {
      return Skia.RuntimeEffect.Make(whiteNoiseShader);
    } catch (error) {
      console.error('Failed to create shader:', error);
      return null;
    }
  }, []);

  if (!runtimeEffect) {
    // Fallback to solid color
    return (
      <Canvas style={StyleSheet.absoluteFillObject}>
        <Fill color="#0b090d" />
      </Canvas>
    );
  }

  // Create uniforms with derived value
  const uniforms = useDerivedValue(() => {
    return {
      u_resolution: [width, height],
      u_time: time.value,
    };
  });

  return (
    <Canvas style={StyleSheet.absoluteFillObject}>
      {/* Gradient noise background */}
      <Fill>
        <Shader source={runtimeEffect} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};
