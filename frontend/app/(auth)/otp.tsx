import { useEffect, useRef, useState } from 'react';
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
import { useTheme } from '@/src/store/theme';
import { useAuthStore } from '@/src/store/auth';
import { verifyOtp } from '@/src/api';
import { palette, radius, spacing } from '@/src/theme';

const OTP_LEN = 6;

export default function OtpScreen() {
  const router = useRouter();
  const theme = useTheme();
  const pendingPhone = useAuthStore((s) => s.pendingPhone);
  const loginSuccess = useAuthStore((s) => s.loginSuccess);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LEN).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const setAt = (idx: number, v: string) => {
    const clean = v.replace(/[^0-9]/g, '').slice(0, 1);
    const next = [...digits];
    next[idx] = clean;
    setDigits(next);
    if (clean && idx < OTP_LEN - 1) inputs.current[idx + 1]?.focus();
  };

  const onKeyPress = (idx: number, key: string) => {
    if (key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const code = digits.join('');
  const canSubmit = code.length === OTP_LEN;

  const onVerify = async () => {
    if (!pendingPhone) return;
    setError(null);
    setLoading(true);
    try {
      const res = await verifyOtp(pendingPhone, code);
      loginSuccess(res.token, {
        id: res.user.id,
        phoneNumber: res.user.phoneNumber,
        name: res.user.name,
        status: res.user.status,
        walletBalance: res.user.walletBalance,
      });
      if (res.user.status === 'PENDING_KYC') {
        router.replace('/(auth)/kyc');
      } else {
        router.replace('/(main)/home');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
            testID="otp-back-button"
          >
            <Ionicons name="chevron-back" size={22} color={theme.colors.onSurface} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>Verify OTP</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceSecondary }]}>
            We sent a 6-digit code to {pendingPhone ?? 'your phone'}.
          </Text>

          <View
            style={[styles.devBanner, { backgroundColor: theme.colors.brandTertiary }]}
            testID="dev-otp-banner"
          >
            <Ionicons name="information-circle" size={16} color={palette.brandSecondary} />
            <Text style={[styles.devText, { color: palette.brandSecondary }]}>
              Dev mode OTP: 123456
            </Text>
          </View>

          <View style={styles.otpRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={(r) => {
                  inputs.current[i] = r;
                }}
                testID={`otp-digit-${i}`}
                value={d}
                onChangeText={(v) => setAt(i, v)}
                onKeyPress={({ nativeEvent }) => onKeyPress(i, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={1}
                style={[
                  styles.otpBox,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    color: theme.colors.onSurface,
                    borderColor: d
                      ? theme.colors.brand
                      : error
                      ? theme.colors.error
                      : 'transparent',
                  },
                ]}
              />
            ))}
          </View>

          {error ? (
            <Text style={[styles.error, { color: theme.colors.error }]} testID="otp-error">
              {error}
            </Text>
          ) : null}

          <View style={styles.resendRow}>
            <Text style={{ color: theme.colors.onSurfaceTertiary, fontSize: 13 }}>
              Didn't receive the code?{' '}
            </Text>
            {secondsLeft > 0 ? (
              <Text style={{ color: theme.colors.onSurfaceTertiary, fontSize: 13 }}>
                Resend in {secondsLeft}s
              </Text>
            ) : (
              <Pressable onPress={() => setSecondsLeft(30)} testID="otp-resend">
                <Text style={{ color: theme.colors.brand, fontSize: 13, fontWeight: '700' }}>
                  Resend
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            label="Verify & Continue"
            onPress={onVerify}
            loading={loading}
            disabled={!canSubmit}
            testID="otp-verify-button"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  title: { fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 8, lineHeight: 20 },
  devBanner: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  devText: { fontSize: 12, fontWeight: '700' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl2 },
  otpBox: {
    width: 48,
    height: 60,
    borderRadius: radius.md,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    borderWidth: 2,
  },
  error: { marginTop: 12, fontSize: 13, fontWeight: '500' },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footer: { padding: spacing.xl },
});
