import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/src/store/theme';
import { useAuthStore } from '@/src/store/auth';
import { palette, radius, spacing } from '@/src/theme';

const TOP_UPS = [100, 200, 500, 1000];

export default function WalletScreen() {
  const router = useRouter();
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const topUp = useAuthStore((s) => s.topUp);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
          testID="wallet-back"
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Wallet</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xl3 }}>
        <View style={[styles.balCard, { backgroundColor: theme.colors.surfaceInverse }]}>
          <Text style={styles.balLabel}>CURRENT BALANCE</Text>
          <Text style={[styles.balValue, { color: theme.colors.onSurfaceInverse }]}>
            ₹{user?.walletBalance.toFixed(0) ?? '0'}
          </Text>
          <View style={styles.balRow}>
            <Ionicons name="flash" size={14} color={palette.brand} />
            <Text style={[styles.balSub, { color: palette.brand }]}>
              Auto top-up enabled · ₹100 saved per ride
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceTertiary }]}>
          QUICK TOP-UP
        </Text>
        <View style={styles.grid}>
          {TOP_UPS.map((amt) => (
            <Pressable
              key={amt}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                topUp(amt);
              }}
              style={[styles.amtCard, { backgroundColor: theme.colors.surfaceSecondary }]}
              testID={`topup-${amt}`}
            >
              <Text style={[styles.amtValue, { color: theme.colors.onSurface }]}>₹{amt}</Text>
              <Text style={[styles.amtSub, { color: theme.colors.onSurfaceTertiary }]}>
                + ₹{Math.round(amt * 0.05)} bonus
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceTertiary }]}>
          PAYMENT METHODS
        </Text>
        <View style={[styles.method, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <View style={[styles.methodIcon, { backgroundColor: theme.colors.brand }]}>
            <Ionicons name="card" size={20} color={palette.brandOn} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.methodTitle, { color: theme.colors.onSurface }]}>UPI</Text>
            <Text style={[styles.methodSub, { color: theme.colors.onSurfaceSecondary }]}>
              rider@upi · Default
            </Text>
          </View>
          <Ionicons name="checkmark-circle" size={22} color={theme.colors.brand} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  balCard: { padding: spacing.lg, borderRadius: radius.lg },
  balLabel: { color: '#999', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  balValue: { fontSize: 36, fontWeight: '900', letterSpacing: -0.5, marginTop: 4 },
  balRow: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 4 },
  balSub: { fontSize: 12, fontWeight: '700' },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  amtCard: {
    width: '47%',
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'flex-start',
  },
  amtValue: { fontSize: 22, fontWeight: '900' },
  amtSub: { fontSize: 11, marginTop: 2 },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  methodIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  methodTitle: { fontSize: 15, fontWeight: '800' },
  methodSub: { fontSize: 12, marginTop: 2 },
});
