import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/src/store/theme';
import { radius, spacing } from '@/src/theme';

const FAQS = [
  { q: 'How does scanning to unlock work?', a: 'Tap "Scan to Unlock" on home, align the QR sticker on the EV, the ride begins automatically.' },
  { q: 'What if the battery dies mid-ride?', a: 'Park safely in any ZeroFuel zone and end the ride — we will dispatch a swap team.' },
  { q: 'Can I pause my ride?', a: 'Yes, riders get up to 10 minutes of paid pause time per ride. Just tap Pause on the active ride sheet.' },
  { q: 'How do refunds work?', a: 'Refunds for cancelled rides are credited to your ZeroFuel wallet instantly.' },
];

export default function HelpScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
          testID="help-back"
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Help & Support</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xl3 }}>
        <View style={styles.actions}>
          <Action icon="chatbubble-ellipses" label="Live Chat" />
          <Action icon="call" label="Call us" />
          <Action icon="mail" label="Email" />
        </View>

        <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceTertiary }]}>
          FREQUENTLY ASKED
        </Text>
        {FAQS.map((f, i) => (
          <View key={i} style={[styles.faq, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <Text style={[styles.q, { color: theme.colors.onSurface }]}>{f.q}</Text>
            <Text style={[styles.a, { color: theme.colors.onSurfaceSecondary }]}>{f.a}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Action({ icon, label }: { icon: any; label: string }) {
  const theme = useTheme();
  return (
    <Pressable style={[styles.action, { backgroundColor: theme.colors.surfaceSecondary }]}>
      <View style={[styles.actionIcon, { backgroundColor: theme.colors.brandTertiary }]}>
        <Ionicons name={icon} size={18} color={theme.colors.brandSecondary} />
      </View>
      <Text style={[styles.actionLabel, { color: theme.colors.onSurface }]}>{label}</Text>
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
  actions: { flexDirection: 'row', gap: spacing.md },
  action: { flex: 1, padding: spacing.md, borderRadius: radius.lg, alignItems: 'center', gap: 8 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 13, fontWeight: '700' },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.md },
  faq: { padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.md },
  q: { fontSize: 15, fontWeight: '800' },
  a: { fontSize: 13, marginTop: 6, lineHeight: 20 },
});
