import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/theme';

import { Icon } from './Icon';
import { Text } from './Text';

export interface SectionHeaderProps {
  title: string;
  /** Action textuelle alignée à droite. */
  actionLabel?: string;
  onAction?: () => void;
}

/** Intertitre de section, avec action facultative à droite. */
export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text variant="subtitle" style={styles.title}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          android_ripple={{ color: theme.tint.primary, borderless: true }}
          hitSlop={8}
          style={styles.action}
        >
          <Text variant="label" tone="primary">
            {actionLabel}
          </Text>
          <Icon name="chevronR" size={16} tone="primary" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
