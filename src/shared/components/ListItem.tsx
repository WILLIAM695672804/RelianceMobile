import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface ListItemProps {
  label: string;
  /** Information secondaire (valeur courante, statut). */
  detail?: string;
  /** Icône de tête, dans un carré teinté. */
  icon?: IconName;
  /** Contenu aligné à droite, avant le chevron. */
  trailing?: ReactNode;
  /** Sans action, la ligne est purement informative. */
  onPress?: () => void;
  testID?: string;
}

/** Ligne de liste Material : icône de tête, libellé, détail, chevron si actionnable. */
export function ListItem({ label, detail, icon, trailing, onPress, testID }: ListItemProps) {
  const theme = useTheme();
  const rowStyle = [styles.row, { borderBottomColor: theme.colors.divider }];
  const content = (
    <>
      {icon ? (
        <View
          style={[
            styles.leading,
            { backgroundColor: theme.tint.primary, borderRadius: theme.radius.md },
          ]}
        >
          <Icon
            name={icon}
            size={20}
            tone="primary"
            testID={testID ? `${testID}-icon` : undefined}
          />
        </View>
      ) : null}
      <View style={styles.texts}>
        <Text>{label}</Text>
        {detail ? (
          <Text variant="caption" tone="muted">
            {detail}
          </Text>
        ) : null}
      </View>
      {trailing}
      {onPress ? (
        <Icon
          name="chevronR"
          size={18}
          tone="muted"
          testID={testID ? `${testID}-chevron` : undefined}
        />
      ) : null}
    </>
  );

  if (!onPress) {
    return (
      <View testID={testID} style={rowStyle}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={detail}
      onPress={onPress}
      testID={testID}
      android_ripple={{ color: theme.tint.primary }}
      style={({ pressed }) => [rowStyle, { opacity: pressed ? 0.8 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: MIN_TOUCH_TARGET + 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leading: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
});
