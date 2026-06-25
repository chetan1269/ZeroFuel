import React, { createContext, useContext } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useTheme } from '@/src/store/theme';

// Web stub for react-native-maps so the web preview builds AND looks decent.
// Positions markers via lat/lng using the provided region.

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const RegionCtx = createContext<Region | null>(null);

const Stub: React.FC<any> = ({ children, style, initialRegion }) => {
  const theme = useTheme();
  const region: Region = initialRegion ?? {
    latitude: 12.9716,
    longitude: 77.6412,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };
  return (
    <View style={[styles.web, { backgroundColor: theme.colors.mapBg }, style]}>
      <View style={styles.grid}>
        {Array.from({ length: 18 }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={[styles.line, { top: i * 60, backgroundColor: theme.colors.border }]}
          />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={[styles.vline, { left: i * 60, backgroundColor: theme.colors.border }]}
          />
        ))}
        {/* Decorative diagonal "road" */}
        <View
          style={[
            styles.road,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        />
        <View
          style={[
            styles.road2,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        />
      </View>
      <RegionCtx.Provider value={region}>{children}</RegionCtx.Provider>
      <Text
        style={[
          styles.webLabel,
          { color: theme.colors.onSurfaceTertiary, backgroundColor: theme.colors.surface },
        ]}
      >
        Map preview · open on iOS/Android for live map
      </Text>
    </View>
  );
};

export const MapView = Stub;

export const Marker = ({
  coordinate,
  children,
  onPress,
}: {
  coordinate?: { latitude: number; longitude: number };
  children?: React.ReactNode;
  onPress?: () => void;
  tracksViewChanges?: boolean;
}) => {
  const region = useContext(RegionCtx);
  if (!coordinate || !region) return <>{children}</>;

  // Map latitude/longitude into 0..1 within the region delta box, then to %.
  const xPct =
    0.5 + (coordinate.longitude - region.longitude) / region.longitudeDelta;
  // y axis is inverted (north is up)
  const yPct = 0.5 - (coordinate.latitude - region.latitude) / region.latitudeDelta;
  const left = `${Math.max(0, Math.min(100, xPct * 100))}%`;
  const top = `${Math.max(0, Math.min(100, yPct * 100))}%`;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.marker,
        { left: left as any, top: top as any },
      ]}
    >
      {children}
    </Pressable>
  );
};

export const PROVIDER_GOOGLE: any = undefined;

const styles = StyleSheet.create({
  web: { flex: 1, overflow: 'hidden', position: 'relative' },
  grid: { ...StyleSheet.absoluteFillObject, opacity: 0.6 },
  line: { position: 'absolute', left: 0, right: 0, height: 1, opacity: 0.5 },
  vline: { position: 'absolute', top: 0, bottom: 0, width: 1, opacity: 0.5 },
  road: {
    position: 'absolute',
    left: '-20%',
    top: '38%',
    width: '160%',
    height: 22,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    transform: [{ rotate: '12deg' }],
    opacity: 0.9,
  },
  road2: {
    position: 'absolute',
    left: '-10%',
    top: '70%',
    width: '140%',
    height: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    transform: [{ rotate: '-8deg' }],
    opacity: 0.7,
  },
  marker: {
    position: 'absolute',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  webLabel: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
