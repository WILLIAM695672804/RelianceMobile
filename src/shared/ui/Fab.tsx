import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsive } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { TAB_BAR_HEIGHT, TAB_BAR_OFFSET } from './TabBar';

export interface FabProps {
  accessibilityLabel: string;
  onPress: () => void;
  icon?: IconName;
  /** Placé au-dessus de la barre d'onglets lorsqu'elle est affichée. */
  aboveTabBar?: boolean;
  testID?: string;
}

/** Bouton d'action flottant des maquettes : carré arrondi de 60 points, cerné du fond. */
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
  const bottom =
    (aboveTabBar ? TAB_BAR_OFFSET + TAB_BAR_HEIGHT - 6 : TAB_BAR_OFFSET) + insets.bottom;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => ({
        position: 'absolute',
        right: gutter,
        bottom,
        width: 60,
        height: 60,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: theme.colors.background,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.9 : 1,
        boxShadow: `0px 12px 30px ${theme.colors.primary}55`,
      })}
    >
      <Icon name={icon} size={26} strokeWidth={2.5} color={theme.colors.onPrimary} />
    </Pressable>
  );
}
