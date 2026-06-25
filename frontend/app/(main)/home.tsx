import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

import { MapView, Marker } from '@/src/components/Map';
import { EvMarker, HubMarker } from '@/src/components/MapMarkers';
import Button from '@/src/components/Button';
import { useTheme, useThemeStore } from '@/src/store/theme';
import { useAuthStore } from '@/src/store/auth';
import { useRentalStore } from '@/src/store/rental';
import { fetchNearbyHubs, fetchNearbyVehicles } from '@/src/api';
import { HOME_REGION, Hub, Vehicle } from '@/src/data/mock';
import { palette, radius, spacing } from '@/src/theme';

type Selection =
  | { kind: 'vehicle'; data: Vehicle }
  | { kind: 'hub'; data: Hub }
  | null;

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toggleTheme = useThemeStore((s) => s.toggle);
  const user = useAuthStore((s) => s.user);
  const active = useRentalStore((s) => s.active);
  const startRental = useRentalStore((s) => s.startRental);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState<Selection>(null);

  const sheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['18%', '55%', '88%'], []);

  useEffect(() => {
    let mounted = true;
    Promise.all([fetchNearbyVehicles(), fetchNearbyHubs()]).then(([v, h]) => {
      if (!mounted) return;
      setVehicles(v);
      setHubs(h);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (active) router.replace('/(main)/active');
  }, [active, router]);

  const nearestHub = hubs[0];

  const onSelectVehicle = (v: Vehicle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelection({ kind: 'vehicle', data: v });
    sheetRef.current?.snapToIndex(1);
  };
  const onSelectHub = (h: Hub) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelection({ kind: 'hub', data: h });
    sheetRef.current?.snapToIndex(2);
  };

  const onNearestHub = () => {
    if (!nearestHub) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setSelection({ kind: 'hub', data: nearestHub });
    sheetRef.current?.snapToIndex(2);
  };

  const onReserve = () => {
    if (selection?.kind !== 'vehicle') return;
    if (user?.status === 'PENDING_KYC') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push({
      pathname: '/(main)/price-calculator',
      params: { vehicleId: selection.data.id, hubId: selection.data.hubId ?? '' },
    });
  };

  const onPickEvFromHub = (v: Vehicle) => {
    if (user?.status === 'PENDING_KYC') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push({
      pathname: '/(main)/price-calculator',
      params: { vehicleId: v.id, hubId: v.hubId ?? '' },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={HOME_REGION}
        showsUserLocation={Platform.OS !== 'web'}
        showsMyLocationButton={false}
        testID="home-map"
      >
        {hubs.map((h) => (
          <Marker
            key={h.id}
            coordinate={{ latitude: h.latitude, longitude: h.longitude }}
            onPress={() => onSelectHub(h)}
            tracksViewChanges={false}
          >
            <HubMarker type="hub" count={h.availableEvs} selected={selection?.kind === 'hub' && selection.data.id === h.id} />
          </Marker>
        ))}
        {vehicles.map((v) => (
          <Marker
            key={v.id}
            coordinate={{ latitude: v.latitude, longitude: v.longitude }}
            onPress={() => onSelectVehicle(v)}
            tracksViewChanges={false}
          >
            <EvMarker type="ev" battery={v.battery} selected={selection?.kind === 'vehicle' && selection.data.id === v.id} />
          </Marker>
        ))}
      </MapView>

      {/* Top floating bar */}
      <SafeAreaView edges={['top']} style={styles.topBar} pointerEvents="box-none">
        <View style={styles.topRow}>
          <Pressable
            onPress={() => router.push('/(main)/profile')}
            testID="home-profile-avatar"
            style={[styles.avatar, { backgroundColor: theme.colors.surface }]}
          >
            <Text style={[styles.avatarText, { color: theme.colors.onSurface }]}>
              {(user?.name?.[0] ?? 'R').toUpperCase()}
            </Text>
          </Pressable>

          <View
            style={[
              styles.searchPill,
              { backgroundColor: theme.colors.surface, shadowColor: '#000' },
            ]}
          >
            <Ionicons name="search" size={18} color={theme.colors.onSurfaceTertiary} />
            <TextInput
              placeholder="Where to?"
              placeholderTextColor={theme.colors.onSurfaceTertiary}
              style={[styles.searchInput, { color: theme.colors.onSurface }]}
              testID="home-search-input"
            />
          </View>

          <Pressable
            onPress={toggleTheme}
            testID="home-theme-toggle"
            style={[styles.avatar, { backgroundColor: theme.colors.surface }]}
          >
            <Ionicons
              name={theme.mode === 'light' ? 'moon' : 'sunny'}
              size={18}
              color={theme.colors.onSurface}
            />
          </Pressable>
        </View>

        {user?.status === 'PENDING_KYC' ? (
          <View
            style={[styles.kycBanner, { backgroundColor: '#FFB80022' }]}
            testID="kyc-banner"
          >
            <Ionicons name="time" size={16} color={palette.warning} />
            <Text style={[styles.kycText, { color: theme.colors.onSurface }]}>
              Verification in Progress · You'll be able to ride shortly.
            </Text>
          </View>
        ) : null}

        {/* Nearest Hub pill button */}
        {nearestHub ? (
          <Pressable
            onPress={onNearestHub}
            testID="nearest-hub-button"
            style={[
              styles.nearestPill,
              { backgroundColor: theme.colors.brand },
            ]}
          >
            <Ionicons name="locate" size={16} color={palette.brandOn} />
            <Text style={[styles.nearestText, { color: palette.brandOn }]}>
              Nearest Hub · {nearestHub.availableEvs} EVs
            </Text>
          </Pressable>
        ) : null}
      </SafeAreaView>

      {/* Floating QR FAB */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          router.push('/(main)/qr-scan');
        }}
        testID="qr-scan-fab"
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.surfaceInverse,
            bottom: insets.bottom + 170,
          },
        ]}
      >
        <View style={[styles.fabInner, { backgroundColor: theme.colors.brand }]}>
          <MaterialCommunityIcons name="qrcode-scan" size={22} color={palette.brandOn} />
        </View>
        <Text style={[styles.fabLabel, { color: theme.colors.onSurfaceInverse }]}>
          Scan to Unlock
        </Text>
      </Pressable>

      {loading ? (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator color={theme.colors.brand} size="large" />
        </View>
      ) : null}

      {/* Bottom sheet */}
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.borderStrong }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={1}
            disappearsOnIndex={0}
            pressBehavior="collapse"
            opacity={0.35}
          />
        )}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 32 }}
        >
          {selection?.kind === 'vehicle' ? (
            <VehicleDetails vehicle={selection.data} onReserve={onReserve} kycPending={user?.status === 'PENDING_KYC'} />
          ) : selection?.kind === 'hub' ? (
            <HubDetails
              hub={selection.data}
              vehicles={vehicles.filter((v) => v.hubId === selection.data.id)}
              onPickEv={onPickEvFromHub}
              kycPending={user?.status === 'PENDING_KYC'}
            />
          ) : (
            <DefaultSheet hub={nearestHub} count={vehicles.length} onOpenHub={onNearestHub} />
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

function DefaultSheet({
  hub,
  count,
  onOpenHub,
}: {
  hub?: Hub;
  count: number;
  onOpenHub: () => void;
}) {
  const theme = useTheme();
  return (
    <View>
      <Text style={[styles.sheetTitle, { color: theme.colors.onSurface }]}>
        {count} EVs near you
      </Text>
      {hub ? (
        <Pressable
          onPress={onOpenHub}
          style={[styles.card, { backgroundColor: theme.colors.surfaceSecondary }]}
          testID="nearest-hub-card"
        >
          <View
            style={[styles.cardIcon, { backgroundColor: theme.colors.brand }]}
          >
            <Ionicons name="business" size={20} color={palette.brandOn} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Nearest Hub · {hub.name}
            </Text>
            <Text style={[styles.cardSub, { color: theme.colors.onSurfaceSecondary }]}>
              {hub.availableEvs} EVs available · 320m away
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.onSurfaceTertiary} />
        </Pressable>
      ) : null}
      <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceTertiary }]}>
        TIP
      </Text>
      <View style={[styles.tip, { backgroundColor: theme.colors.brandTertiary }]}>
        <Ionicons name="flash" size={16} color={palette.brandSecondary} />
        <Text style={[styles.tipText, { color: theme.colors.onSurface }]}>
          Tap any green pin to view the EV, then Reserve or Scan its QR.
        </Text>
      </View>
    </View>
  );
}

function VehicleDetails({
  vehicle,
  onReserve,
  kycPending,
}: {
  vehicle: Vehicle;
  onReserve: () => void;
  kycPending?: boolean;
}) {
  const theme = useTheme();
  return (
    <View>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceTertiary }]}>
            {vehicle.brand.toUpperCase()}
          </Text>
          <Text style={[styles.sheetTitle, { color: theme.colors.onSurface }]}>
            {vehicle.model}
          </Text>
        </View>
        <View style={[styles.priceTag, { backgroundColor: theme.colors.brand }]}>
          <Text style={{ color: palette.brandOn, fontWeight: '800', fontSize: 13 }}>
            ₹{vehicle.pricePerMin}/min
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Stat icon="battery-charging" label="Battery" value={`${vehicle.battery}%`} />
        <Stat icon="speedometer" label="Range" value={`${vehicle.rangeKm} km`} />
        <Stat icon="time" label="Unlock" value="₹15" />
      </View>

      <View
        style={[styles.bigBattery, { backgroundColor: theme.colors.surfaceSecondary }]}
      >
        <View style={styles.batteryRow}>
          <Text style={[styles.batteryLabel, { color: theme.colors.onSurfaceSecondary }]}>
            Charge
          </Text>
          <Text style={[styles.batteryPct, { color: theme.colors.onSurface }]}>
            {vehicle.battery}%
          </Text>
        </View>
        <View style={[styles.barBg, { backgroundColor: theme.colors.surfaceTertiary }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${vehicle.battery}%`,
                backgroundColor:
                  vehicle.battery > 50
                    ? theme.colors.brand
                    : vehicle.battery > 20
                    ? palette.warning
                    : theme.colors.error,
              },
            ]}
          />
        </View>
        <Text style={[styles.batterySub, { color: theme.colors.onSurfaceTertiary }]}>
          ~{vehicle.rangeKm} km of range remaining
        </Text>
      </View>

      {kycPending ? (
        <View
          style={[styles.kycInline, { backgroundColor: '#FFB80022' }]}
          testID="vehicle-kyc-warning"
        >
          <Ionicons name="alert-circle" size={16} color={palette.warning} />
          <Text style={[styles.kycText, { color: theme.colors.onSurface }]}>
            KYC verification pending. You'll be able to reserve once approved.
          </Text>
        </View>
      ) : null}

      <View style={{ height: 16 }} />
      <Button
        label="Reserve Vehicle"
        onPress={onReserve}
        disabled={kycPending}
        testID="reserve-vehicle-button"
        icon={<Ionicons name="flash" size={18} color={palette.brandOn} />}
      />
    </View>
  );
}

function HubDetails({
  hub,
  vehicles,
  onPickEv,
  kycPending,
}: {
  hub: Hub;
  vehicles: Vehicle[];
  onPickEv: (v: Vehicle) => void;
  kycPending?: boolean;
}) {
  const theme = useTheme();
  return (
    <View>
      <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceTertiary }]}>
        ZEROFUEL HUB
      </Text>
      <Text style={[styles.sheetTitle, { color: theme.colors.onSurface }]}>{hub.name}</Text>
      <Text style={[styles.cardSub, { color: theme.colors.onSurfaceSecondary, marginTop: 4 }]}>
        {hub.address}
      </Text>
      <View style={styles.statsRow}>
        <Stat icon="flash" label="Available" value={`${hub.availableEvs}`} />
        <Stat icon="grid" label="Slots" value={`${hub.totalSlots}`} />
        <Stat icon="navigate" label="Distance" value="0.32 km" />
      </View>

      <Text
        style={[styles.sectionLabel, { color: theme.colors.onSurfaceTertiary, marginTop: spacing.lg }]}
        testID="hub-evs-heading"
      >
        AVAILABLE EVS · {vehicles.length}
      </Text>

      {vehicles.length === 0 ? (
        <View style={[styles.evEmpty, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <Ionicons name="alert-circle" size={18} color={theme.colors.onSurfaceTertiary} />
          <Text style={[styles.evEmptyText, { color: theme.colors.onSurfaceSecondary }]}>
            No EVs available right now. Pull to refresh.
          </Text>
        </View>
      ) : (
        vehicles.map((v) => (
          <Pressable
            key={v.id}
            onPress={() => onPickEv(v)}
            disabled={kycPending}
            testID={`hub-ev-${v.id}`}
            style={({ pressed }) => [
              styles.evRow,
              {
                backgroundColor: theme.colors.surfaceSecondary,
                opacity: kycPending ? 0.55 : pressed ? 0.85 : 1,
              },
            ]}
          >
            <View style={[styles.evIcon, { backgroundColor: theme.colors.brandTertiary }]}>
              <MaterialCommunityIcons
                name="scooter-electric"
                size={24}
                color={theme.colors.brandSecondary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.evTitle, { color: theme.colors.onSurface }]}>
                {v.model}
              </Text>
              <View style={styles.evMetaRow}>
                <Ionicons name="flash" size={11} color={theme.colors.brandSecondary} />
                <Text style={[styles.evMeta, { color: theme.colors.onSurfaceSecondary }]}>
                  {v.battery}% · {v.rangeKm} km left
                </Text>
              </View>
            </View>
            <View style={[styles.evPrice, { backgroundColor: theme.colors.brand }]}>
              <Text style={{ color: palette.brandOn, fontWeight: '900', fontSize: 13 }}>
                ₹{v.pricePerMin}/min
              </Text>
            </View>
          </Pressable>
        ))
      )}

      {kycPending ? (
        <View
          style={[styles.kycInline, { backgroundColor: '#FFB80022', marginTop: spacing.md }]}
          testID="hub-kyc-warning"
        >
          <Ionicons name="alert-circle" size={16} color={palette.warning} />
          <Text style={[styles.kycText, { color: theme.colors.onSurface }]}>
            Complete KYC to start picking an EV.
          </Text>
        </View>
      ) : null}

      <View style={{ height: 8 }} />
      <Button
        label="Get Directions to Hub"
        variant="secondary"
        onPress={() => {}}
        testID="hub-directions-button"
        icon={<Ionicons name="navigate" size={18} color={theme.colors.onSurface} />}
      />
    </View>
  );
}

function Stat({ icon, label, value }: { icon: any; label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.colors.surfaceSecondary }]}>
      <Ionicons name={icon} size={16} color={theme.colors.brandSecondary} />
      <Text style={[styles.statVal, { color: theme.colors.onSurface }]}>{value}</Text>
      <Text style={[styles.statLbl, { color: theme.colors.onSurfaceTertiary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, padding: spacing.lg, gap: spacing.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatarText: { fontSize: 15, fontWeight: '800' },
  searchPill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500' },
  kycBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginLeft: spacing.xs,
  },
  kycText: { fontSize: 12, fontWeight: '600', flexShrink: 1 },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 6,
    paddingRight: 18,
    height: 52,
    borderRadius: 26,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  fabInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: { fontSize: 14, fontWeight: '800' },
  loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.4, marginBottom: spacing.lg, marginTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  cardIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '800' },
  cardSub: { fontSize: 12, marginTop: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: spacing.lg, marginBottom: 6 },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  tipText: { flex: 1, fontSize: 12, fontWeight: '500', lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  priceTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  stat: { flex: 1, padding: spacing.md, borderRadius: radius.md, alignItems: 'flex-start' },
  statVal: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  statLbl: { fontSize: 11, marginTop: 2 },
  bigBattery: { marginTop: spacing.lg, padding: spacing.lg, borderRadius: radius.lg },
  batteryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  batteryLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  batteryPct: { fontSize: 22, fontWeight: '900' },
  barBg: { height: 10, borderRadius: 5, marginTop: 8, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  batterySub: { fontSize: 11, marginTop: 8 },
  kycInline: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  nearestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginLeft: spacing.xs,
    shadowColor: '#1ED760',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  nearestText: { fontSize: 13, fontWeight: '800' },
  evRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  evIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  evTitle: { fontSize: 15, fontWeight: '800' },
  evMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  evMeta: { fontSize: 12 },
  evPrice: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  evEmpty: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    gap: 8,
  },
  evEmptyText: { fontSize: 13, fontWeight: '500' },
});
