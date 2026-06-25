import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { palette } from '@/src/theme';

type Props = {
  size?: number;
  color?: string;
};

// Decorative floating neon orb that rotates and pulses — gives a soft "3D" depth feel.
export default function NeonOrb({ size = 200, color = palette.brand }: Props) {
  const rot = useSharedValue(0);
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    rot.value = withRepeat(withTiming(1, { duration: 12000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [rot, pulse]);

  const orb = useAnimatedStyle(() => ({
    transform: [
      { perspective: 600 },
      { rotateY: `${rot.value * 360}deg` },
      { scale: 0.94 + pulse.value * 0.08 },
    ],
    opacity: 0.55 + pulse.value * 0.25,
  }));

  const ring = useAnimatedStyle(() => ({
    transform: [
      { perspective: 600 },
      { rotateX: `70deg` },
      { rotateZ: `${rot.value * 360}deg` },
    ],
  }));

  return (
    <View
      style={[
        styles.wrap,
        { width: size * 1.6, height: size * 1.6 },
      ]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.glow,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
          orb,
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          {
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: (size * 1.5) / 2,
            borderColor: color,
          },
          ring,
        ]}
      />
      <View
        style={[
          styles.core,
          { width: size * 0.45, height: size * 0.45, borderRadius: (size * 0.45) / 2, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    opacity: 0.4,
    // shadow for the glow halo
    shadowColor: '#1ED760',
    shadowOpacity: 1,
    shadowRadius: 60,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    opacity: 0.35,
  },
  core: {
    opacity: 0.95,
    shadowColor: '#1ED760',
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
});
