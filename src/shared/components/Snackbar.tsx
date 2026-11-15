import { Pressable, StyleSheet, View } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type SnackbarTone = 'info' | 'success' | 'danger';

/** Les maquettes (`ToastsScreen`) n'emploient que ces trois tons. */
const ICONS: Record<SnackbarTone, IconName> = {
  info: 'info',
  success: 'check',
  danger: 'close',
};

export interface SnackbarProps {
  message: string;
  tone?: SnackbarTone;
  /** Action facultative placée à droite du message. */
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

/**
 * Bandeau éphémère, transposition du catalogue `ToastsScreen` des maquettes.
 * Le relief des maquettes (`boxShadow`) est rendu par `theme.elevation`, l'ombre CSS
 * n'existant pas en natif.
 */
export function Snackbar({
  message,
  tone = 'info',
  actionLabel,
  onAction,
  testID = 'snackbar',
}: SnackbarProps) {
  const theme = useTheme();
  const color = {
    info: theme.colors.primary,
    success: theme.colors.success,
    danger: theme.colors.danger,
  }[tone];

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
      testID={testID}
      style={[
        styles.row,
        theme.elevation.medium,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          gap: theme.spacing.sm,
        },
      ]}
    >
      <Icon name={ICONS[tone]} size={18} color={color} testID={`${testID}-icon`} />
      <Text variant="label" style={styles.message}>
        {message}
      </Text>
      {actionLabel !== undefined && onAction !== undefined ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          hitSlop={(MIN_TOUCH_TARGET - 24) / 2}
          android_ripple={{ color: theme.colors.border, borderless: true }}
          testID={`${testID}-action`}
        >
          <Text variant="label" tone="primary">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth },
  message: { flex: 1 },
});
