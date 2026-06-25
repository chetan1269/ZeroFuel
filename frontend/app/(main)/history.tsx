import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/src/store/theme';
import { useRentalStore } from '@/src/store/rental';
import { radius, spacing } from '@/src/theme';

export default function HistoryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const history = useRentalStore((s) => s.history);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
          testID="history-back"
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Ride History</Text>
        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xl3 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={36} color={theme.colors.onSurfaceTertiary} />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceSecondary }]}>
              No rides yet. Your future rides will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const date = new Date(item.startedAt);
          return (
            <View
              style={[styles.card, { backgroundColor: theme.colors.surfaceSecondary }]}
              testID={`ride-${item.id}`}
            >
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.brandTertiary }]}>
                <Ionicons name="flash" size={20} color={theme.colors.brandSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                  {item.vehicleModel}
                </Text>
                <Text style={[styles.sub, { color: theme.colors.onSurfaceSecondary }]}>
                  {date.toLocaleDateString()} · {item.durationMin} min
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.cost, { color: theme.colors.onSurface }]}>
                  ₹{item.cost.toFixed(0)}
                </Text>
                <Text style={[styles.status, { color: theme.colors.brandSecondary }]}>
                  Completed
                </Text>
              </View>
            </View>
          );
        }}
      />
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '800' },
  sub: { fontSize: 12, marginTop: 2 },
  cost: { fontSize: 16, fontWeight: '900' },
  status: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: spacing.xl3 },
  emptyText: { fontSize: 13, textAlign: 'center', maxWidth: 240 },
});
