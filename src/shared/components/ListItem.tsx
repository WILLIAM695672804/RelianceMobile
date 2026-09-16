import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/theme';

import { Text } from './Text';

export interface ListItemProps {
  label: string;
  /** Information secondaire (valeur courante, statut). */
  detail?: string;
  /** Sans action, la ligne est purement informative. */
  onPress?: () => void;
  testID?: string;
}

/** Ligne de liste : libellé, détail et chevron lorsqu'elle est actionnable. */
export function ListItem({ label, detail, onPress, testID }: ListItemProps) {
  const theme = useTheme();
  const rowStyle = [styles.row, { borderBottomColor: theme.colors.divider }];
  const content = (
    <>
      <View style={styles.texts}>
        <Text>{label}</Text>
        {detail ? (
          <Text variant="caption" tone="muted">
            {detail}
          </Text>
        ) : null}
      </View>
      {onPress ? (
        <Text tone="muted" importantForAccessibility="no">
          ›
        </Text>
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
      style={({ pressed }) => [rowStyle, { opacity: pressed ? 0.7 : 1 }]}
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
    minHeight: 52,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  texts: { flex: 1, gap: 2 },
});
