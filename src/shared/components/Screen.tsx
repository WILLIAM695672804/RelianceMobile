import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useResponsive } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { AppBar } from './AppBar';
import { OfflineBanner } from './OfflineBanner';

export interface ScreenProps {
  children: ReactNode;
  /** Contenu défilant (formulaires, listes courtes). */
  scroll?: boolean;
  /** Tirer pour rafraîchir ; rend le contenu défilant. */
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Fourni, coiffe l'écran d'une barre supérieure Android. */
  title?: string;
  onBack?: () => void;
  actions?: ReactNode;
  /** Zone d'action basse, hors de la zone défilante. */
  footer?: ReactNode;
  /** Supprime la gouttière : au contenu de gérer ses marges (listes pleine largeur). */
  flush?: boolean;
  testID?: string;
}

/**
 * Conteneur d'écran : zones sûres, fond du thème, bandeau hors ligne, barre supérieure
 * et pied facultatifs. La gouttière suit la classe de taille de la fenêtre et le contenu
 * est borné puis centré au-delà de 600 dp de large.
 */
export function Screen({
  children,
  scroll = false,
  onRefresh,
  refreshing = false,
  title,
  onBack,
  actions,
  footer,
  flush = false,
  testID,
}: ScreenProps) {
  const theme = useTheme();
  const { gutter, maxContentWidth } = useResponsive();
  const scrollable = scroll || onRefresh !== undefined;
  const padding = flush ? 0 : gutter;
  const contentStyle = {
    padding,
    gap: theme.spacing.lg,
    width: '100%' as const,
    maxWidth: maxContentWidth,
    alignSelf: 'center' as const,
  };

  const content = scrollable ? (
    <ScrollView
      testID="screen-scroll"
      contentContainerStyle={contentStyle}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[contentStyle, styles.fill]}>{children}</View>
  );

  return (
    <SafeAreaView
      testID={testID}
      edges={['top', 'left', 'right']}
      style={[styles.fill, { backgroundColor: theme.colors.background }]}
    >
      <OfflineBanner />
      {title !== undefined ? <AppBar title={title} onBack={onBack} actions={actions} /> : null}
      {content}
      {footer !== undefined ? (
        <View
          testID="screen-footer"
          style={[
            styles.footer,
            {
              paddingHorizontal: gutter,
              paddingVertical: theme.spacing.md,
              borderTopColor: theme.colors.divider,
              backgroundColor: theme.colors.background,
              maxWidth: maxContentWidth,
            },
          ]}
        >
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  footer: { width: '100%', alignSelf: 'center', borderTopWidth: StyleSheet.hairlineWidth, gap: 8 },
});
