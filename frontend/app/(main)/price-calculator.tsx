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
import { MOCK_VEHICLES, MOCK_HUBS } from '@/src/data/mock';
import { palette, radius, spacing } from '@/src/theme';

type Plan = {
  id: string;
  label: string;
  minutes: number;
  flatPrice?: number; // INR
  hint: string;
};

const PLANS: Plan[] = [
  { id: '30m', label: '30 min', minutes: 30, hint: 'Quick errand' },
  { id: '1h', label: '1 hour', minutes: 60, hint: 'City run' },
  { id: '4h', label: '4 hours', minutes: 240, flatPrice: 400, hint: '4-hr flat ₹400' },
  { id: '1d', label: '1 day', minutes: 24 * 60, flatPrice: 999, hint: 'Day pass ₹999' },
];

export default function PriceCalculator() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ vehicleId?: string; hubId?: string }>();

  const vehicle = useMemo(
    () => MOCK_VEHICLES.find((v) => v.id === params.vehicleId) ?? MOCK_VEHICLES[0],
    [params.vehicleId],
  );
  const hub = useMemo(
    () => MOCK_HUBS.find((h) => h.id === (params.hubId ?? vehicle.hubId)),
    [params.hubId, vehicle.hubId],
  );

  const [planId, setPlanId] = useState<string>('1h');
  const plan = PLANS.find((p) => p.id === planId)!;

  const baseUnlockFee = 15;
  const meterPrice = Math.round(plan.minutes * vehicle.pricePerMin);
  const totalPrice = plan.flatPrice ?? meterPrice + baseUnlockFee;
  const youSave = plan.flatPrice
    ? Math.max(0, meterPrice + baseUnlockFee - plan.flatPrice)
    : 0;

  const onCheckout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    router.push({
      pathname: '/rental/billing',
      params: {
        vehicleId: vehicle.id,
        hubId: hub?.id ?? '',
        planId: plan.id,
        price: String(totalPrice),
        minutes: String(plan.minutes),
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Decorative 3D backdrop */}
      <View style={styles.orbWrap} pointerEvents="none">
        <NeonOrb size={260} color={theme.colors.brand} />
      </View>

      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
          testID="price-back"
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Price Calculator
        </Text>
        <View style={{ width: 38 }} />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 3D Tilt EV hero card */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <TiltCard testID="ev-tilt-card">
            <LinearGradient
              colors={[theme.colors.surfaceInverse, theme.mode === 'light' ? '#1A1A1A' : '#0E0E0E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <View style={styles.heroTopRow}>
                <Text style={[styles.heroBrand, { color: theme.colors.brand }]}>
                  {vehicle.brand.toUpperCase()}
                </Text>
                <View style={styles.batChip}>
                  <Ionicons name="flash" size={12} color={palette.brandOn} />
                  <Text style={styles.batChipTxt}>{vehicle.battery}%</Text>
                </View>
              </View>
              <Text style={styles.heroModel}>{vehicle.model}</Text>
              <View style={styles.heroIconWrap}>
                <MaterialCommunityIcons name="scooter-electric" size={120} color={palette.brand} />
              </View>
              <View style={styles.heroBottom}>
                <View>
                  <Text style={styles.heroLabel}>RANGE</Text>
                  <Text style={styles.heroValue}>{vehicle.rangeKm} km</Text>
                </View>
                <View>
                  <Text style={styles.heroLabel}>RATE</Text>
                  <Text style={styles.heroValue}>₹{vehicle.pricePerMin}/min</Text>
                </View>
                <View>
                  <Text style={styles.heroLabel}>UNLOCK</Text>
                  <Text style={styles.heroValue}>₹{baseUnlockFee}</Text>
                </View>
              </View>
            </LinearGradient>
          </TiltCard>
        </Animated.View>

        <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceTertiary }]}>
          CHOOSE DURATION
        </Text>

        <View style={styles.plans}>
          {PLANS.map((p, idx) => {
            const isActive = p.id === planId;
            return (
              <Animated.View
                key={p.id}
                entering={FadeIn.delay(80 * idx)}
                style={{ width: '48%' }}
              >
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setPlanId(p.id);
                  }}
                  testID={`plan-${p.id}`}
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: isActive
                        ? theme.colors.brand
                        : theme.colors.surfaceSecondary,
                      borderColor: isActive ? theme.colors.brand : theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.planRow}>
                    <Text
                      style={[
                        styles.planLabel,
                        { color: isActive ? palette.brandOn : theme.colors.onSurface },
                      ]}
                    >
                      {p.label}
                    </Text>
                    {p.flatPrice ? (
                      <View
                        style={[
                          styles.flatBadge,
                          {
                            backgroundColor: isActive
                              ? 'rgba(0,0,0,0.15)'
                              : theme.colors.brandTertiary,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: isActive ? palette.brandOn : theme.colors.brandSecondary,
                            fontWeight: '800',
                            fontSize: 10,
                          }}
                        >
                          FLAT
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.planPrice,
                      { color: isActive ? palette.brandOn : theme.colors.onSurface },
                    ]}
                  >
                    ₹{p.flatPrice ?? p.minutes * vehicle.pricePerMin + baseUnlockFee}
                  </Text>
                  <Text
                    style={[
                      styles.planHint,
                      {
                        color: isActive
                          ? 'rgba(0,0,0,0.6)'
                          : theme.colors.onSurfaceTertiary,
                      },
                    ]}
                  >
                    {p.hint}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* Summary breakdown */}
        <View
          style={[styles.summary, { backgroundColor: theme.colors.surfaceSecondary }]}
          testID="price-summary"
        >
          <SumRow label="Time fare" value={`₹${meterPrice}`} muted />
          <SumRow label="Unlock fee" value={`₹${baseUnlockFee}`} muted />
          {plan.flatPrice ? (
            <SumRow label="Flat plan discount" value={`- ₹${youSave}`} positive />
          ) : null}
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SumRow label="Total" value={`₹${totalPrice}`} bold />
          {youSave > 0 ? (
            <Text style={[styles.saveBanner, { color: theme.colors.brandSecondary }]}>
              <Ionicons name="sparkles" size={12} /> You save ₹{youSave} with this plan
            </Text>
          ) : null}
        </View>

        {hub ? (
          <Text style={[styles.hubInfo, { color: theme.colors.onSurfaceTertiary }]}>
            Pickup · {hub.name}
          </Text>
        ) : null}
      </ScrollView>

      {/* Floating checkout */}
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
        <View style={styles.footerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.footerLabel, { color: theme.colors.onSurfaceTertiary }]}>
              TOTAL
            </Text>
            <Text style={[styles.footerPrice, { color: theme.colors.onSurface }]}>
              ₹{totalPrice}
            </Text>
          </View>
          <View style={{ flex: 1.2 }}>
            <Button
              label="Checkout"
              onPress={onCheckout}
              testID="checkout-button"
              icon={<Ionicons name="arrow-forward" size={18} color={palette.brandOn} />}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function SumRow({
  label,
  value,
  muted,
  bold,
  positive,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
  positive?: boolean;
}) {
  const theme = useTheme();
  const color = positive
    ? theme.colors.brandSecondary
    : muted
    ? theme.colors.onSurfaceSecondary
    : theme.colors.onSurface;
  return (
    <View style={styles.sumRow}>
      <Text style={{ color, fontSize: bold ? 16 : 13, fontWeight: bold ? '800' : '500' }}>
        {label}
      </Text>
      <Text style={{ color, fontSize: bold ? 20 : 13, fontWeight: bold ? '900' : '600' }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orbWrap: { position: 'absolute', top: -40, right: -120, opacity: 0.4 },
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
  hero: {
    borderRadius: 28,
    padding: spacing.lg,
    overflow: 'hidden',
    minHeight: 230,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroBrand: { fontSize: 12, fontWeight: '900', letterSpacing: 2 },
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
  heroModel: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', letterSpacing: -0.5, marginTop: 4 },
  heroIconWrap: { alignItems: 'center', marginVertical: 4 },
  heroBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  heroLabel: { color: '#888', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginTop: 2 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  plans: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  planCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    minHeight: 100,
  },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planLabel: { fontSize: 14, fontWeight: '800' },
  planPrice: { fontSize: 22, fontWeight: '900', letterSpacing: -0.4, marginTop: 8 },
  planHint: { fontSize: 11, marginTop: 2 },
  flatBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  summary: { padding: spacing.lg, borderRadius: radius.lg, marginTop: spacing.lg },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  divider: { height: 1, marginVertical: spacing.sm },
  saveBanner: { marginTop: 8, fontSize: 12, fontWeight: '700' },
  hubInfo: { marginTop: spacing.lg, fontSize: 12, textAlign: 'center', fontWeight: '600' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  footerLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  footerPrice: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
});
