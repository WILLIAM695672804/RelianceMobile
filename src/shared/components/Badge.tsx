import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/theme';

import { Text } from './Text';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

/** Pastille de statut. */
export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const theme = useTheme();
  const color = {
    neutral: theme.colors.textMuted,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
  }[tone];

  return (
    <View style={[styles.badge, { borderColor: color, borderRadius: theme.radius.pill }]}>
      <Text variant="caption" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 2 },
});
