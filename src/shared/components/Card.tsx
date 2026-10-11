import type { ReactNode } from 'react';
import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/core/theme';

export type CardTone = 'surface' | 'muted' | 'primary';

export interface CardProps {
  children: ReactNode;
  tone?: CardTone;
  /** Fournie, la carte devient actionnable et porte une onde de pression. */
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Élève la carte au lieu de la border. */
  elevated?: boolean;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Surface de regroupement : bordure fine ou élévation, rayon large. */
export function Card({
  children,
  tone = 'surface',
  onPress,
  accessibilityLabel,
  elevated = false,
  padding,
  style,
  testID,
}: CardProps) {
  const theme = useTheme();
  const backgroundColor = {
    surface: theme.colors.surface,
    muted: theme.colors.surfaceMuted,
    primary: theme.tint.primary,
  }[tone];
  const base: StyleProp<ViewStyle> = [
    {
      backgroundColor,
      borderColor: theme.colors.border,
      borderWidth: elevated ? 0 : 1,
      borderRadius: theme.radius.lg,
      padding: padding ?? theme.spacing.lg,
      gap: theme.spacing.sm,
      overflow: 'hidden',
    },
    elevated ? [theme.elevation.low, { shadowColor: theme.colors.ink }] : null,
    style,
  ];

  if (!onPress) {
    return (
      <View testID={testID} style={base}>
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
      android_ripple={{ color: theme.tint.primary }}
      style={({ pressed }) => [base, { opacity: pressed ? 0.92 : 1 }]}
    >
      {children}
    </Pressable>
  );
}
