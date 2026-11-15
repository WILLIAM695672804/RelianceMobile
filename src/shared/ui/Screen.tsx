import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsive } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { TAB_BAR_CLEARANCE } from './TabBar';

export interface ScreenProps {
  children: ReactNode;
  /** Contenu défilant (par défaut). */
  scroll?: boolean;
  /** Applique la gouttière de l'écran au contenu. */
  padded?: boolean;
  /** Réserve la place de la barre d'onglets flottante. */
  withTabBar?: boolean;
  /** Zone fixe sous le contenu (bouton principal d'un formulaire). */
  footer?: ReactNode;
  testID?: string;
}

/**
 * Cadre d'un écran : fond du thème, marge de la zone sûre, contenu centré et borné sur
 * tablette. La barre d'état reste celle du système.
 */
export function Screen({
  children,
  scroll = true,
  padded = false,
  withTabBar = false,
  footer,
  testID,
}: ScreenProps) {
  const theme = useTheme();
  const { gutter, maxContentWidth } = useResponsive();
  const insets = useSafeAreaInsets();
  const column = {
    width: '100%' as const,
    maxWidth: maxContentWidth,
    alignSelf: 'center' as const,
    paddingHorizontal: padded ? gutter : 0,
  };
  const bottomSpace = withTabBar
    ? TAB_BAR_CLEARANCE + insets.bottom
    : footer
      ? 16
      : 24 + insets.bottom;

  return (
    <View
      testID={testID}
      style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top }}
    >
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[column, { flexGrow: 1, paddingBottom: bottomSpace }]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[column, { flex: 1, paddingBottom: bottomSpace }]}>{children}</View>
      )}
      {footer ? (
        <View style={[column, { paddingHorizontal: gutter, paddingBottom: 16 + insets.bottom }]}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}
