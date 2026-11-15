import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/core/theme';

export interface CardProps {
  children: ReactNode;
  /** Marge intérieure, 16 points dans les maquettes. */
  padding?: number;
  /** Fournie, la carte devient un bouton. */
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Réservé à la mise en page (marges, flex). */
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Carte des maquettes : surface, filet, arrondi de 20 points et ombre légère. */
export function Card({
  children,
  padding = 16,
  onPress,
  accessibilityLabel,
  style,
  testID,
}: CardProps) {
  const theme = useTheme();
  const surface: StyleProp<ViewStyle> = [
    {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding,
    },
    theme.shadow.card,
    style,
  ];
  if (!onPress) {
    return (
      <View testID={testID} style={surface}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [surface, pressed ? { opacity: 0.85 } : null]}
    >
      {children}
    </Pressable>
  );
}
