import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import Button from '@/src/components/Button';
import TiltCard from '@/src/components/TiltCard';
import NeonOrb from '@/src/components/NeonOrb';
import { useTheme } from '@/src/store/theme';
import { useAuthStore } from '@/src/store/auth';
import { useRentalStore } from '@/src/store/rental';
import { MOCK_HUBS, MOCK_VEHICLES } from '@/src/data/mock';
import { palette, radius, spacing } from '@/src/theme';

type PayMethod = 'wallet' | 'upi' | 'card';

export default function Billing() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    vehicleId?: string;
    hubId?: string;
    planId?: string;
    price?: string;
    minutes?: string;
  }>();

  const vehicle = useMemo(
    () => MOCK_VEHICLES.find((v) => v.id === params.vehicleId) ?? MOCK_VEHICLES[0],
    [params.vehicleId],
  );
  const hub = useMemo(
    () => MOCK_HUBS.find((h) => h.id === (params.hubId || vehicle.hubId)),
    [params.hubId, vehicle.hubId],
  );

  const price = Number(params.price ?? '0');
  const minutes = Number(params.minutes ?? '60');
  const durationLabel =
    minutes >= 1440
      ? `${Math.round(minutes / 1440)} day`
      : minutes >= 60
      ? `${Math.round(minutes / 60)} hour${minutes >= 120 ? 's' : ''}`
      : `${minutes} min`;

  const user = useAuthStore((s) => s.user);
  const spend = useAuthStore((s) => s.spend);
  const startRental = useRentalStore((s) => s.startRental);

  const [method, setMethod] = useState<PayMethod>('wallet');
  const [confirming, setConfirming] = useState(false);

  const walletBalance = user?.walletBalance ?? 0;
  const insufficient = method === 'wallet' && walletBalance < price;

  const onConfirm = async () => {
    if (insufficient) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setConfirming(true);
    // Mock payment latency
    setTimeout(() => {
      if (method === 'wallet') spend(price);
      startRental(vehicle);
      setConfirming(false);
      router.replace('/(main)/active');
    }, 900);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* 3D decorative orb backdrop */}
      <View style={styles.orbWrap} pointerEvents="none">
        <NeonOrb size={320} color={theme.colors.brand} />
      </View>

      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
          testID="billing-back"
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Checkout</Text>
        <View style={{ width: 38 }} />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 140 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 3D Tilt order summary card */}
        <Animated.View entering={FadeInDown.duration(450)}>
          <TiltCard testID="order-tilt-card" intensity={10}>
            <LinearGradient
              colors={[theme.colors.surfaceInverse, theme.mode === 'light' ? '#1B1B1B' : '#101010']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.order}
            >
              <View style={styles.orderTopRow}>
                <View>
                  <Text style={styles.orderLabel}>ORDER SUMMARY</Text>
                  <Text style={styles.orderTitle}>{vehicle.model}</Text>
                </View>
                <View style={styles.batChip}>
                  <Ionicons name="flash" size={12} color={palette.brandOn} />
                  <Text style={styles.batChipTxt}>{vehicle.battery}%</Text>
                </View>
              </View>

              <View style={styles.evIconWrap}>
                <MaterialCommunityIcons name="scooter-electric" size={92} color={palette.brand} />
              </View>

              <View style={styles.orderRow}>
                <DetailItem icon="business" label="Pickup" value={hub?.name ?? '—'} />
                <DetailItem icon="time" label="Duration" value={durationLabel} />
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL PAYABLE</Text>
                <Text style={styles.totalPrice}>₹{price}</Text>
              </View>
            </LinearGradient>
          </TiltCard>
        </Animated.View>

        <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceTertiary }]}>
          PAYMENT METHOD
        </Text>

        <Animated.View entering={FadeIn.delay(100)}>
          <PayOption
            id="wallet"
            label="ZeroFuel Wallet"
            sub={`Balance ₹${walletBalance.toFixed(0)}${insufficient ? ' · Low balance' : ''}`}
            icon="wallet"
            active={method === 'wallet'}
            onPress={() => setMethod('wallet')}
            warning={insufficient}
          />
          <PayOption
            id="upi"
            label="UPI"
            sub="rider@upi"
            icon="phone-portrait"
            active={method === 'upi'}
            onPress={() => setMethod('upi')}
          />
          <PayOption
            id="card"
            label="Credit / Debit Card"
            sub="•••• 4242 · Visa"
            icon="card"
            active={method === 'card'}
            onPress={() => setMethod('card')}
          />
        </Animated.View>

        <View
          style={[styles.note, { backgroundColor: theme.colors.brandTertiary }]}
          testID="billing-note"
        >
          <Ionicons name="shield-checkmark" size={16} color={theme.colors.brandSecondary} />
          <Text style={[styles.noteText, { color: theme.colors.onSurface }]}>
            ₹500 security deposit will be held and auto-refunded when you end the ride.
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.surface,
            paddingBottom: insets.bottom + spacing.md,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <Button
          label={
            confirming
              ? 'Unlocking…'
              : insufficient
              ? 'Insufficient Wallet Balance'
              : 'Confirm Payment & Unlock EV'
          }
          onPress={onConfirm}
          loading={confirming}
          disabled={insufficient}
          testID="confirm-payment-button"
          icon={<Ionicons name="lock-open" size={18} color={palette.brandOn} />}
        />
      </View>
    </View>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={detail.box}>
      <View style={detail.row}>
        <Ionicons name={icon} size={12} color={palette.brand} />
        <Text style={detail.label}>{label}</Text>
      </View>
      <Text style={detail.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const detail = StyleSheet.create({
  box: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  label: { color: '#888', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  value: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginTop: 4 },
});

function PayOption({
  label,
  sub,
  icon,
  active,
  onPress,
  warning,
  id,
}: {
  id: PayMethod;
  label: string;
  sub: string;
  icon: any;
  active: boolean;
  onPress: () => void;
  warning?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      testID={`pay-${id}`}
      style={[
        styles.pay,
        {
          backgroundColor: theme.colors.surfaceSecondary,
          borderColor: active ? theme.colors.brand : 'transparent',
        },
      ]}
    >
      <View
        style={[
          styles.payIcon,
          { backgroundColor: active ? theme.colors.brand : theme.colors.surfaceTertiary },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={active ? palette.brandOn : theme.colors.onSurface}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.payLabel, { color: theme.colors.onSurface }]}>{label}</Text>
        <Text
          style={[
            styles.paySub,
            { color: warning ? theme.colors.error : theme.colors.onSurfaceSecondary },
          ]}
        >
          {sub}
        </Text>
      </View>
      <View
        style={[
          styles.radio,
          {
            borderColor: active ? theme.colors.brand : theme.colors.borderStrong,
            backgroundColor: active ? theme.colors.brand : 'transparent',
          },
        ]}
      >
        {active ? <Ionicons name="checkmark" size={14} color={palette.brandOn} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orbWrap: { position: 'absolute', top: -100, left: -160, opacity: 0.5 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  order: {
    borderRadius: 28,
    padding: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  orderTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  orderLabel: { color: '#888', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  orderTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.4, marginTop: 2 },
  batChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.brand,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  batChipTxt: { color: palette.brandOn, fontWeight: '800', fontSize: 11 },
  evIconWrap: { alignItems: 'center', marginVertical: spacing.md },
  orderRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm, paddingHorizontal: 4 },
  totalRow: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: { color: '#999', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  totalPrice: { color: palette.brand, fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  pay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    marginBottom: spacing.md,
  },
  payIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  payLabel: { fontSize: 15, fontWeight: '800' },
  paySub: { fontSize: 12, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  noteText: { flex: 1, fontSize: 12, fontWeight: '500', lineHeight: 18 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
});
