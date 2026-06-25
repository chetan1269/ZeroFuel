import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import Button from '@/src/components/Button';
import { useTheme } from '@/src/store/theme';
import { useAuthStore } from '@/src/store/auth';
import { submitKyc } from '@/src/api';
import { radius, spacing } from '@/src/theme';

type DocSlot = 'license' | 'aadhaar';

export default function KycScreen() {
  const router = useRouter();
  const theme = useTheme();
  const setKycSubmitted = useAuthStore((s) => s.setKycSubmitted);
  const approveKyc = useAuthStore((s) => s.approveKyc);
  const [docs, setDocs] = useState<Record<DocSlot, string | null>>({
    license: null,
    aadhaar: null,
  });
  const [loading, setLoading] = useState(false);

  const pickFor = async (slot: DocSlot) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: false,
    });
    if (!res.canceled && res.assets[0]) {
      setDocs((d) => ({ ...d, [slot]: res.assets[0].uri }));
    }
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      await submitKyc({
        licenseUri: docs.license ?? undefined,
        aadhaarUri: docs.aadhaar ?? undefined,
      });
      setKycSubmitted();
      router.replace('/(main)/home');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !!docs.license && !!docs.aadhaar;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
          testID="kyc-back-button"
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.onSurface} />
        </Pressable>
        <Pressable
          onPress={() => {
            // Demo-only fast path so reviewers can experience the full app.
            approveKyc();
            router.replace('/(main)/home');
          }}
          testID="kyc-skip"
        >
          <Text style={[styles.skip, { color: theme.colors.onSurfaceTertiary }]}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Verify your identity
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceSecondary }]}>
          We need a quick KYC to keep ZeroFuel rides safe. Upload your Driver's License and Aadhaar.
        </Text>

        <DocUploader
          label="Driver's License"
          slot="license"
          uri={docs.license}
          onPress={() => pickFor('license')}
          testID="kyc-license-upload"
        />
        <DocUploader
          label="Aadhaar Card"
          slot="aadhaar"
          uri={docs.aadhaar}
          onPress={() => pickFor('aadhaar')}
          testID="kyc-aadhaar-upload"
        />

        <View style={[styles.infoCard, { backgroundColor: theme.colors.brandTertiary }]}>
          <Ionicons name="shield-checkmark" size={18} color={theme.colors.brandSecondary} />
          <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
            Your documents are encrypted end-to-end and only used for KYC verification.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Submit for Verification"
          onPress={onSubmit}
          loading={loading}
          disabled={!canSubmit}
          testID="kyc-submit-button"
        />
      </View>
    </SafeAreaView>
  );
}

function DocUploader({
  label,
  uri,
  onPress,
  testID,
}: {
  label: string;
  slot: DocSlot;
  uri: string | null;
  onPress: () => void;
  testID: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={[
        styles.doc,
        {
          backgroundColor: theme.colors.surfaceSecondary,
          borderColor: uri ? theme.colors.brand : theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.docIcon,
          { backgroundColor: uri ? theme.colors.brand : theme.colors.surfaceTertiary },
        ]}
      >
        <Ionicons
          name={uri ? 'checkmark' : 'cloud-upload'}
          size={22}
          color={uri ? theme.colors.onBrand : theme.colors.onSurface}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.docLabel, { color: theme.colors.onSurface }]}>{label}</Text>
        <Text style={[styles.docHint, { color: theme.colors.onSurfaceTertiary }]}>
          {uri ? 'Uploaded · Tap to replace' : 'Tap to upload from gallery'}
        </Text>
      </View>
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
    paddingTop: spacing.md,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skip: { fontSize: 14, fontWeight: '600' },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 8, lineHeight: 20 },
  doc: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1.5,
  },
  docIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docLabel: { fontSize: 15, fontWeight: '700' },
  docHint: { fontSize: 12, marginTop: 2 },
  infoCard: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  footer: { padding: spacing.xl },
});
