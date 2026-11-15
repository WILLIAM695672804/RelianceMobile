import { View } from 'react-native';

import { useTheme } from '@/core/theme';

import { Icon } from './Icon';

/** Cinq étoiles, pleines jusqu'à la note. */
export function Stars({ value, size = 11 }: { value: number; size?: number }) {
  const theme = useTheme();
  return (
    <View accessible accessibilityLabel={`${value}/5`} style={{ flexDirection: 'row', gap: 1 }}>
      {Array.from({ length: 5 }, (_, index) => (
        <Icon
          key={index}
          name="star"
          size={size}
          color={index < Math.round(value) ? theme.colors.warning : theme.colors.border}
        />
      ))}
    </View>
  );
}
