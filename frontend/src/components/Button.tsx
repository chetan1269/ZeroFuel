import React from 'react';
import { Pressable, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/store/theme';
import { radius, spacing } from '@/src/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  testID?: string;
  fullWidth?: boolean;
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  icon,
  testID,
  fullWidth = true,
}: Props) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const bg =
    variant === 'primary'
      ? theme.colors.brand
      : variant === 'secondary'
      ? theme.colors.surfaceTertiary
      : 'transparent';
  const fg =
    variant === 'primary'
      ? theme.colors.onBrand
      : theme.colors.onSurface;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        onPress();
      }}
      disabled={isDisabled}
      testID={testID}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
        !fullWidth && { alignSelf: 'flex-start', paddingHorizontal: spacing.xl },
        variant === 'ghost' && { borderWidth: 1, borderColor: theme.colors.border },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
});
