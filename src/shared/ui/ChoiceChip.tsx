import { Pressable } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Icon } from './Icon';
import { Text } from './Text';

export interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** `filter` : pastille sélectionnable ; `removable` : filtre actif, avec croix. */
  variant?: 'filter' | 'removable';
  testID?: string;
}

const HEIGHT = 30;

/** Puce de choix des maquettes (filtres de recherche, sélecteur de variantes). */
export function ChoiceChip({
  label,
  selected,
  onPress,
  variant = 'filter',
  testID,
}: ChoiceChipProps) {
  const theme = useTheme();
  const slop = (MIN_TOUCH_TARGET - HEIGHT) / 2;

  if (variant === 'removable') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        hitSlop={{ top: slop, bottom: slop }}
        testID={testID}
        style={{
          height: 26,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingLeft: 10,
          paddingRight: 8,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.tint.primary,
        }}
      >
        <Text
          variant="caption"
          tone="primary"
          style={{ fontFamily: theme.fontFamily.bodySemiBold }}
        >
          {label}
        </Text>
        <Icon name="close" size={11} strokeWidth={2.5} tone="primary" />
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={{ top: slop, bottom: slop }}
      testID={testID}
      style={{
        height: HEIGHT,
        justifyContent: 'center',
        paddingHorizontal: 12,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor: selected ? theme.colors.text : theme.colors.border,
        backgroundColor: selected ? theme.colors.text : theme.colors.surface,
      }}
    >
      <Text
        variant="caption"
        style={{
          fontFamily: theme.fontFamily.bodySemiBold,
          color: selected ? theme.colors.background : theme.colors.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
