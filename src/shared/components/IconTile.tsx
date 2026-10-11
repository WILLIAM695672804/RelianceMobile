import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface IconTileProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  /** Marque la tuile comme choisie (bordure accentuée). */
  selected?: boolean;
  testID?: string;
}

/** Tuile de catégorie : icône dans un carré teinté, libellé centré. */
export function IconTile({ icon, label, onPress, selected = false, testID }: IconTileProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      testID={testID}
      android_ripple={{ color: theme.tint.primary }}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderWidth: selected ? 2 : 1,
          borderRadius: theme.radius.md,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.square,
          { backgroundColor: theme.tint.primary, borderRadius: theme.radius.md },
        ]}
      >
        <Icon name={icon} size={22} tone="primary" />
      </View>
      <Text variant="label" numberOfLines={2} style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  square: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  label: { textAlign: 'center' },
});
