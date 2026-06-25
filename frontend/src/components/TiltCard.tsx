import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

type Props = {
  children: React.ReactNode;
  width?: number;
  height?: number;
  intensity?: number; // degrees of max tilt
  floating?: boolean; // adds subtle idle hover animation
  testID?: string;
};

// A premium 3D tilt-on-touch card using Reanimated 2 + RNGH.
// Wraps any content; pan to tilt in X/Y with perspective. Springs back on release.
// Also includes a subtle idle "floating" animation for delight.
export default function TiltCard({
  children,
  width,
  height,
  intensity = 14,
  floating = true,
  testID,
}: Props) {
  const rx = useSharedValue(0);
  const ry = useSharedValue(0);
  const float = useSharedValue(0);

  React.useEffect(() => {
    if (!floating) return;
    float.value = withRepeat(
      withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [floating, float]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      // Normalize translation to roughly [-1..1] and map to degrees
      const nx = Math.max(-1, Math.min(1, e.translationX / 120));
      const ny = Math.max(-1, Math.min(1, e.translationY / 120));
      ry.value = nx * intensity;
      rx.value = -ny * intensity;
    })
    .onEnd(() => {
      rx.value = withSpring(0, { damping: 8, stiffness: 90 });
      ry.value = withSpring(0, { damping: 8, stiffness: 90 });
    });

  const style = useAnimatedStyle(() => {
    const lift = floating ? (float.value - 0.5) * 6 : 0;
    return {
      transform: [
        { perspective: 800 },
        { rotateX: `${rx.value}deg` },
        { rotateY: `${ry.value}deg` },
        { translateY: lift },
      ],
    };
  });

  // GestureDetector on web is limited; keep visual but skip gestures gracefully.
  const Wrapped = (
    <Animated.View
      testID={testID}
      style={[styles.card, { width, height }, style]}
    >
      {children}
    </Animated.View>
  );

  if (Platform.OS === 'web') {
    // Static (still floats) on web — Pan gestures via RNGH on web are jittery.
    return <View>{Wrapped}</View>;
  }

  return (
    <GestureDetector gesture={pan}>
      <View>{Wrapped}</View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: { alignSelf: 'center' },
});
