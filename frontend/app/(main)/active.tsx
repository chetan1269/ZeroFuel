import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { MapView, Marker } from '@/src/components/Map';
import { EvMarker } from '@/src/components/MapMarkers';
import SwipeToEnd from '@/src/components/SwipeToEnd';
import { useTheme } from '@/src/store/theme';
import { useRentalStore } from '@/src/store/rental';
import { useAuthStore } from '@/src/store/auth';
import { palette, radius, spacing } from '@/src/theme';

export default function ActiveRentalScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const active = useRentalStore((s) => s.active);
  const endRental = useRentalStore((s) => s.endRental);
  const spend = useAuthStore((s) => s.spend);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!active) router.replace('/(main)/home');
  }, [active, router]);

  if (!active) return null;

  const ms = now - active.startedAt;
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  const minutesElapsed = totalSec / 60;
  const cost = Math.round(minutesElapsed * active.vehicle.pricePerMin * 10) / 10;
  // Live battery drain illusion: 1% per 2 min
  const battery = Math.max(0, active.vehicle.battery - Math.floor(minutesElapsed / 2));

  const onEnd = () => {
    const completed = endRental();
    if (completed) spend(completed.cost);
    router.replace('/(main)/home');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: active.vehicle.latitude,
          longitude: active.vehicle.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={Platform.OS !== 'web'}
        testID="active-map"
      >
        <Marker
          coordinate={{ latitude: active.vehicle.latitude, longitude: active.vehicle.longitude }}
          tracksViewChanges={false}
        >
          <EvMarker type="ev" battery={battery} selected />
        </Marker>
      </MapView>

      <SafeAreaView edges={['top']} style={styles.topBar} pointerEvents="box-none">
        <View style={[styles.statusPill, { backgroundColor: theme.colors.brand }]}>
          <View style={styles.dot} />
          <Text style={{ color: palette.brandOn, fontWeight: '800', fontSize: 13 }}>
            Ride in progress
          </Text>
        </View>
      </SafeAreaView>

      <View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.colors.surface,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        <View style={styles.handle} />

        <View style={styles.header}>
          <View>
            <Text style={[styles.label, { color: theme.colors.onSurfaceTertiary }]}>
              RIDING
            </Text>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              {active.vehicle.model}
            </Text>
          </View>
          <View style={[styles.batBadge, { backgroundColor: theme.colors.brandTertiary }]}>
            <Ionicons name="battery-charging" size={14} color={theme.colors.brandSecondary} />
            <Text style={{ color: theme.colors.brandSecondary, fontWeight: '800', fontSize: 13 }}>
              {battery}%
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <Metric label="Duration" value={`${mm}:${ss}`} icon="time" />
          <Metric label="Cost" value={`₹${cost.toFixed(1)}`} icon="cash" />
          <Metric label="Range" value={`${Math.max(0, Math.round((battery / 100) * active.vehicle.rangeKm))} km`} icon="speedometer" />
        </View>

        <View style={[styles.tip, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <MaterialCommunityIcons name="information" size={16} color={theme.colors.onSurfaceSecondary} />
          <Text style={[styles.tipText, { color: theme.colors.onSurfaceSecondary }]}>
            Park inside a ZeroFuel zone to end the ride and avoid penalties.
          </Text>
        </View>

        <View style={{ height: 12 }} />
        <SwipeToEnd onComplete={onEnd} testID="swipe-to-end-rental" />
      </View>
    </View>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: any }) {
  const theme = useTheme();
  return (
    <View style={[metric.box, { backgroundColor: theme.colors.surfaceSecondary }]}>
      <Ionicons name={icon} size={16} color={theme.colors.brandSecondary} />
      <Text style={[metric.value, { color: theme.colors.onSurface }]}>{value}</Text>
      <Text style={[metric.label, { color: theme.colors.onSurfaceTertiary }]}>{label}</Text>
    </View>
  );
}

const metric = StyleSheet.create({
  box: { flex: 1, padding: spacing.md, borderRadius: radius.md, alignItems: 'flex-start' },
  value: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  label: { fontSize: 11, marginTop: 2, letterSpacing: 0.4, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', padding: spacing.lg },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#000' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: 8,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#D0D0D0', alignSelf: 'center', marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 22, fontWeight: '900', letterSpacing: -0.4, marginTop: 2 },
  batBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  metricsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  tip: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  tipText: { flex: 1, fontSize: 12, fontWeight: '500', lineHeight: 18 },
});
