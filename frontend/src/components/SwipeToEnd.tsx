import React, { useRef } from 'react';
import { StyleSheet, View, Text, Animated, PanResponder, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/store/theme';

const { width } = Dimensions.get('window');

type Props = {
  label?: string;
  onComplete: () => void;
  testID?: string;
};

export default function SwipeToEnd({ label = 'Swipe to End Rental', onComplete, testID }: Props) {
  const theme = useTheme();
  const TRACK_PADDING = 6;
  const THUMB_SIZE = 52;
  const trackWidth = width - 48; // 24 padding * 2
  const maxX = trackWidth - THUMB_SIZE - TRACK_PADDING * 2;
  const x = useRef(new Animated.Value(0)).current;
  const completedRef = useRef(false);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const v = Math.max(0, Math.min(maxX, g.dx));
        x.setValue(v);
      },
      onPanResponderRelease: (_, g) => {
        const v = Math.max(0, Math.min(maxX, g.dx));
        if (v > maxX * 0.85 && !completedRef.current) {
          completedRef.current = true;
          Animated.timing(x, { toValue: maxX, duration: 100, useNativeDriver: false }).start(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            onComplete();
            setTimeout(() => {
              completedRef.current = false;
              Animated.timing(x, { toValue: 0, duration: 250, useNativeDriver: false }).start();
            }, 600);
          });
        } else {
          Animated.spring(x, { toValue: 0, useNativeDriver: false, bounciness: 6 }).start();
        }
      },
    })
  ).current;

  return (
    <View
      style={[styles.track, { backgroundColor: theme.colors.surfaceTertiary }]}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: theme.colors.brand,
            width: Animated.add(x, new Animated.Value(THUMB_SIZE + TRACK_PADDING * 2)),
          },
        ]}
      />
      <Text style={[styles.label, { color: theme.colors.onSurface }]}>{label}</Text>
      <Animated.View
        {...responder.panHandlers}
        style={[
          styles.thumb,
          {
            backgroundColor: theme.colors.surfaceInverse,
            transform: [{ translateX: x }],
          },
        ]}
        testID="swipe-to-end-thumb"
      >
        <Ionicons name="arrow-forward" size={24} color={theme.colors.onSurfaceInverse} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 64,
    borderRadius: 999,
    justifyContent: 'center',
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
    opacity: 0.55,
  },
  label: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  thumb: {
    position: 'absolute',
    left: 6,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
});
