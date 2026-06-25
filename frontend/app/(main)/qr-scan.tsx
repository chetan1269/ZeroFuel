import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';

import Button from '@/src/components/Button';
import { useTheme } from '@/src/store/theme';
import { useRentalStore } from '@/src/store/rental';
import { useAuthStore } from '@/src/store/auth';
import { MOCK_VEHICLES } from '@/src/data/mock';
import { palette, radius, spacing } from '@/src/theme';

export default function QrScanScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const user = useAuthStore((s) => s.user);
  const startRental = useRentalStore((s) => s.startRental);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const onScanned = () => {
    if (!scanning) return;
    setScanning(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (user?.status === 'PENDING_KYC') {
      router.back();
      return;
    }
    startRental(MOCK_VEHICLES[0]);
    router.replace('/(main)/active');
  };

  const cameraReady = permission?.granted && Platform.OS !== 'web';

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {cameraReady ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          onBarcodeScanned={() => onScanned()}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]}>
          <Ionicons name="qr-code" size={120} color="#1ED760" />
          <Text style={styles.fallbackText}>
            {Platform.OS === 'web'
              ? 'Camera preview disabled on web.'
              : permission?.granted === false
              ? 'Camera permission denied.'
              : 'Requesting camera…'}
          </Text>
        </View>
      )}

      {/* Overlay */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <SafeAreaView edges={['top']} style={styles.topBar} pointerEvents="box-none">
          <Pressable
            onPress={() => router.back()}
            testID="qr-close-button"
            style={styles.iconBtn}
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Scan EV QR</Text>
          <View style={{ width: 38 }} />
        </SafeAreaView>

        <View style={styles.frameWrap} pointerEvents="none">
          <View style={styles.frame}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
          <Text style={styles.hint}>
            Align the QR sticker on the EV's handlebar inside the frame
          </Text>
        </View>

        <SafeAreaView edges={['bottom']} style={styles.bottom}>
          <Button
            label="Simulate Successful Scan"
            onPress={onScanned}
            testID="simulate-scan-button"
            icon={<Ionicons name="flash" size={18} color={palette.brandOn} />}
          />
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0B0B' },
  fallbackText: { color: '#CCC', marginTop: 16, fontSize: 13 },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  frameWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: { width: 240, height: 240, position: 'relative' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#1ED760' },
  tl: { top: 0, left: 0, borderLeftWidth: 4, borderTopWidth: 4, borderTopLeftRadius: 12 },
  tr: { top: 0, right: 0, borderRightWidth: 4, borderTopWidth: 4, borderTopRightRadius: 12 },
  bl: { bottom: 0, left: 0, borderLeftWidth: 4, borderBottomWidth: 4, borderBottomLeftRadius: 12 },
  br: { bottom: 0, right: 0, borderRightWidth: 4, borderBottomWidth: 4, borderBottomRightRadius: 12 },
  hint: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: spacing.xl,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.xl },
});
