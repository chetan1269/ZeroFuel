import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme, useThemeStore } from '@/src/store/theme';
import { useAuthStore } from '@/src/store/auth';
import { useRentalStore } from '@/src/store/rental';
import { palette, radius, spacing } from '@/src/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const history = useRentalStore((s) => s.history);

  const totalRides = history.length;
  const totalSaved = totalRides * 84; // illustrative INR vs petrol

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          testID="profile-back-button"
          style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Account</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl3 }} showsVerticalScrollIndicator={false}>
        <View style={styles.profileWrap}>
          <View style={[styles.avatarLg, { backgroundColor: theme.colors.brand }]}>
            <Text style={styles.avatarLgText}>{(user?.name?.[0] ?? 'R').toUpperCase()}</Text>
          </View>
          <Text style={[styles.name, { color: theme.colors.onSurface }]}>{user?.name ?? 'Rider'}</Text>
          <Text style={[styles.phone, { color: theme.colors.onSurfaceSecondary }]}>
            {user?.phoneNumber ?? '+91 — — —'}
          </Text>

          {user?.status === 'PENDING_KYC' ? (
            <View style={[styles.kyc, { backgroundColor: '#FFB80022' }]}>
              <Ionicons name="time" size={14} color={palette.warning} />
              <Text style={[styles.kycText, { color: theme.colors.onSurface }]}>
                Verification in progress
              </Text>
            </View>
          ) : (
            <View style={[styles.kyc, { backgroundColor: theme.colors.brandTertiary }]}>
              <Ionicons name="checkmark-circle" size={14} color={theme.colors.brandSecondary} />
              <Text style={[styles.kycText, { color: theme.colors.onSurface }]}>KYC Verified</Text>
            </View>
          )}
        </View>

        <View style={[styles.walletCard, { backgroundColor: theme.colors.surfaceInverse }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.walletLabel, { color: '#999' }]}>WALLET BALANCE</Text>
            <Text style={[styles.walletValue, { color: theme.colors.onSurfaceInverse }]}>
              ₹{user?.walletBalance.toFixed(0) ?? '0'}
            </Text>
            <Text style={[styles.walletSub, { color: '#999' }]}>
              {totalRides} rides · saved ~₹{totalSaved}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(main)/wallet')}
            style={[styles.walletBtn, { backgroundColor: theme.colors.brand }]}
            testID="add-money-button"
          >
            <Ionicons name="add" size={18} color={palette.brandOn} />
            <Text style={{ color: palette.brandOn, fontWeight: '800', fontSize: 13 }}>Add</Text>
          </Pressable>
        </View>

        <View style={styles.list}>
          <Row
            icon="receipt-outline"
            label="Ride History"
            onPress={() => router.push('/(main)/history')}
            testID="row-history"
          />
          <Row
            icon="wallet-outline"
            label="Wallet & Payments"
            onPress={() => router.push('/(main)/wallet')}
            testID="row-wallet"
          />
          <Row
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => router.push('/(main)/help')}
            testID="row-help"
          />
          <Row
            icon={mode === 'light' ? 'moon-outline' : 'sunny-outline'}
            label={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            onPress={toggleTheme}
            testID="row-theme"
          />
          <Row
            icon="log-out-outline"
            label="Log Out"
            destructive
            onPress={() => {
              logout();
              router.replace('/(auth)/phone');
            }}
            testID="row-logout"
          />
        </View>

        <Text style={[styles.version, { color: theme.colors.onSurfaceTertiary }]}>
          ZeroFuel · v1.0.0 · Made for India
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  icon,
  label,
  onPress,
  destructive,
  testID,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  testID?: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surfaceSecondary,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: destructive ? '#FF3B3022' : theme.colors.surfaceTertiary },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? theme.colors.error : theme.colors.onSurface}
        />
      </View>
      <Text
        style={[
          styles.rowLabel,
          { color: destructive ? theme.colors.error : theme.colors.onSurface },
        ]}
      >
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.onSurfaceTertiary} />
    </Pressable>
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
  profileWrap: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  avatarLg: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarLgText: { color: '#000', fontSize: 32, fontWeight: '900' },
  name: { fontSize: 22, fontWeight: '900', marginTop: spacing.md, letterSpacing: -0.3 },
  phone: { fontSize: 13, marginTop: 4 },
  kyc: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  kycText: { fontSize: 12, fontWeight: '700' },
  walletCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  walletLabel: { fontSize: 11, letterSpacing: 1.2, fontWeight: '700' },
  walletValue: { fontSize: 32, fontWeight: '900', letterSpacing: -0.5, marginTop: 4 },
  walletSub: { fontSize: 12, marginTop: 4 },
  walletBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  list: { paddingHorizontal: spacing.xl, marginTop: spacing.xl, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  rowIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '700' },
  version: { textAlign: 'center', marginTop: spacing.xl, fontSize: 11 },
});
