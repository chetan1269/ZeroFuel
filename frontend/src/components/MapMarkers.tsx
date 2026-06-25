import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { palette } from '@/src/theme';

type Props = {
  battery?: number;
  selected?: boolean;
  type: 'ev' | 'hub';
  count?: number;
};

export function EvMarker({ battery = 80, selected }: Props) {
  return (
    <View style={[styles.evWrap, selected && styles.selected]}>
      <View style={styles.evBubble}>
        <MaterialCommunityIcons name="scooter-electric" size={20} color="#000" />
      </View>
      <View style={styles.batteryPill}>
        <Ionicons name="flash" size={9} color={palette.brandOn} />
        <Text style={styles.batteryText}>{battery}%</Text>
      </View>
      <View style={styles.evTail} />
    </View>
  );
}

export function HubMarker({ count = 0, selected }: Props) {
  return (
    <View style={[styles.hubWrap, selected && styles.selected]}>
      <View style={styles.hubBubble}>
        <Ionicons name="business" size={16} color="#FFFFFF" />
        <Text style={styles.hubCount}>{count}</Text>
      </View>
      <View style={styles.hubTail} />
    </View>
  );
}

const styles = StyleSheet.create({
  evWrap: { alignItems: 'center' },
  evBubble: {
    backgroundColor: palette.brand,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  evTail: {
    width: 2,
    height: 8,
    backgroundColor: palette.brand,
    marginTop: -1,
  },
  batteryPill: {
    position: 'absolute',
    top: -6,
    right: -14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: palette.brandOn,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 999,
  },
  batteryText: { color: palette.brand, fontSize: 9, fontWeight: '800' },
  selected: { transform: [{ scale: 1.15 }] },
  hubWrap: { alignItems: 'center' },
  hubBubble: {
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: palette.brand,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  hubCount: { color: palette.brand, fontWeight: '800', fontSize: 12 },
  hubTail: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: palette.brand,
  },
});
