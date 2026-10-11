import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  /** Icône placée avant le libellé. */
  icon?: IconName;
  testID?: string;
}

/** Pastille de statut : fond teinté, texte et icône de la couleur sémantique. */
export function Badge({ label, tone = 'neutral', icon, testID }: BadgeProps) {
  const theme = useTheme();
  const color = {
    neutral: theme.colors.textMuted,
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
  }[tone];
  const background = {
    neutral: theme.tint.neutral,
    primary: theme.tint.primary,
    success: theme.tint.success,
    warning: theme.tint.warning,
    danger: theme.tint.danger,
  }[tone];

  return (
    <View
      testID={testID}
      style={[styles.badge, { backgroundColor: background, borderRadius: theme.radius.pill }]}
    >
      {icon ? (
        <Icon name={icon} size={13} color={color} testID={testID ? `${testID}-icon` : undefined} />
      ) : null}
      <Text variant="caption" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
