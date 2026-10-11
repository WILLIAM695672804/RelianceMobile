import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface StatTileProps {
  icon: IconName;
  value: string;
  label: string;
  testID?: string;
}

/** Tuile d'indicateur : icône, valeur en vedette, libellé atténué. */
export function StatTile({ icon, value, label, testID }: StatTileProps) {
  const theme = useTheme();
  return (
    <View
      testID={testID}
      style={[
        styles.tile,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <Icon name={icon} size={20} tone="primary" />
      <Text variant="subtitle">{value}</Text>
      <Text variant="caption" tone="muted" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, gap: 4, padding: 14, borderWidth: 1 },
});
