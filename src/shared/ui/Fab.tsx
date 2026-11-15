import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsive } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { TAB_BAR_HEIGHT, TAB_BAR_OFFSET } from './TabBar';
import { useReducedMotion } from './useReducedMotion';

export interface FabProps {
  accessibilityLabel: string;
  onPress: () => void;
  icon?: IconName;
  /** Placé au-dessus de la barre d'onglets lorsqu'elle est affichée. */
  aboveTabBar?: boolean;
  testID?: string;
}

/** Bouton d'action flottant : carré arrondi de 60 points, cerné du fond, rebond à la pression. */
export function Fab({
  accessibilityLabel,
  onPress,
  icon = 'plus',
  aboveTabBar = true,
  testID,
}: FabProps) {
  const theme = useTheme();
  const { gutter } = useResponsive();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const scale = useState(() => new Animated.Value(1))[0];
  const bottom =
    (aboveTabBar ? TAB_BAR_OFFSET + TAB_BAR_HEIGHT + 12 : TAB_BAR_OFFSET) + insets.bottom;

  const springTo = (value: number) => {
    if (reduceMotion) return;
    Animated.spring(scale, {
      toValue: value,
      damping: 10,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ position: 'absolute', right: gutter, bottom, transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
          onPress();
        }}
        onPressIn={() => springTo(0.88)}
        onPressOut={() => springTo(1)}
        testID={testID}
        style={{
          width: 60,
          height: 60,
          borderRadius: 20,
          borderWidth: 3,
          borderColor: theme.colors.background,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0px 12px 30px ${theme.colors.primary}55`,
        }}
      >
        <Icon name={icon} size={26} strokeWidth={2.5} color={theme.colors.onPrimary} />
      </Pressable>
    </Animated.View>
  );
}
