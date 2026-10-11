import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  onPress: () => void;
  selected?: boolean;
  icon?: IconName;
  testID?: string;
}

/** Puce de filtre Material : contour au repos, fond teinté lorsqu'elle est retenue. */
export function Chip({ label, onPress, selected = false, icon, testID }: ChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      testID={testID}
      android_ripple={{ color: theme.tint.primary }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.tint.primary : 'transparent',
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radius.pill,
        },
      ]}
    >
      {icon ? <Icon name={icon} size={15} tone={selected ? 'primary' : 'muted'} /> : null}
      <Text variant="label" tone={selected ? 'primary' : 'default'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
