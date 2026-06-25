import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Button from '@/src/components/Button';
import { useTheme, useThemeStore } from '@/src/store/theme';
import { useAuthStore } from '@/src/store/auth';
import { requestOtp } from '@/src/api';
import { palette, radius, spacing } from '@/src/theme';

export default function PhoneScreen() {
  const router = useRouter();
  const theme = useTheme();
  const toggleTheme = useThemeStore((s) => s.toggle);
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    setError(null);
    setLoading(true);
    try {
      await requestOtp(phone);
      setPendingPhone(`+91${phone}`);
      router.push('/(auth)/otp');
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Ionicons name="flash" size={18} color={palette.brandOn} />
            </View>
            <Text style={[styles.brand, { color: theme.colors.onSurface }]}>
              Zero<Text style={{ color: theme.colors.brand }}>Fuel</Text>
            </Text>
          </View>
          <Pressable
            onPress={toggleTheme}
            testID="toggle-theme"
            style={[styles.themeBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
          >
            <Ionicons
              name={theme.mode === 'light' ? 'moon' : 'sunny'}
              size={18}
              color={theme.colors.onSurface}
            />
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Welcome to{`\n`}the EV revolution.
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceSecondary }]}>
            Enter your phone number to unlock thousands of electric rides near you.
          </Text>

          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: theme.colors.surfaceSecondary,
                borderColor: error ? theme.colors.error : 'transparent',
              },
            ]}
          >
            <Text style={[styles.prefix, { color: theme.colors.onSurface }]}>+91</Text>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <TextInput
              testID="phone-input"
              value={phone}
              onChangeText={(v) => setPhone(v.replace(/[^0-9]/g, '').slice(0, 10))}
              keyboardType="number-pad"
              placeholder="98765 43210"
              placeholderTextColor={theme.colors.onSurfaceTertiary}
              style={[styles.input, { color: theme.colors.onSurface }]}
              maxLength={10}
            />
          </View>
          {error ? (
            <Text style={[styles.error, { color: theme.colors.error }]} testID="phone-error">
              {error}
            </Text>
          ) : null}

          <Text style={[styles.legal, { color: theme.colors.onSurfaceTertiary }]}>
            By continuing you agree to ZeroFuel's Terms and Privacy Policy.
          </Text>
        </View>

        <View style={styles.footer}>
          <Button
            label="Continue"
            onPress={onContinue}
            loading={loading}
            disabled={phone.length !== 10}
            testID="phone-continue-button"
            icon={<Ionicons name="arrow-forward" size={18} color={palette.brandOn} />}
          />
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: spacing.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontSize: 18, fontWeight: '900', letterSpacing: -0.2 },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl2 },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -0.6, lineHeight: 38 },
  subtitle: { fontSize: 15, marginTop: spacing.md, lineHeight: 22 },
  inputWrap: {
    marginTop: spacing.xl2,
    height: 64,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  prefix: { fontSize: 18, fontWeight: '700' },
  divider: { width: 1, height: 28, marginHorizontal: spacing.md },
  input: { flex: 1, fontSize: 18, fontWeight: '600', letterSpacing: 1 },
  error: { marginTop: 8, fontSize: 13, fontWeight: '500' },
  legal: { marginTop: spacing.lg, fontSize: 12, lineHeight: 18 },
  footer: { padding: spacing.xl, paddingBottom: spacing.xl },
});
