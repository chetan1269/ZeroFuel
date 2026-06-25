import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '@/src/store/auth';
import { useTheme } from '@/src/store/theme';
import { palette } from '@/src/theme';

export default function Index() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const theme = useTheme();

  useEffect(() => {
    const t = setTimeout(() => {
      if (token) {
        router.replace('/(main)/home');
      } else {
        router.replace('/(auth)/phone');
      }
    }, 900);
    return () => clearTimeout(t);
  }, [router, token]);

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]} testID="splash-screen">
      <View style={styles.badge}>
        <Ionicons name="flash" size={32} color={palette.brandOn} />
      </View>
      <Text style={styles.wordmark}>
        Zero<Text style={{ color: palette.brand }}>Fuel</Text>
      </Text>
      <Text style={styles.tagline}>Ride electric. Pay zero fuel.</Text>
      <ActivityIndicator color={theme.colors.brand} style={{ marginTop: 32 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  wordmark: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tagline: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 0.3,
  },
});
