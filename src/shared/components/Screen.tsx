import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/core/theme';

import { OfflineBanner } from './OfflineBanner';

export interface ScreenProps {
  children: ReactNode;
  /** Contenu défilant (formulaires, listes courtes). */
  scroll?: boolean;
  /** Tirer pour rafraîchir ; rend le contenu défilant. */
  onRefresh?: () => void;
  refreshing?: boolean;
  testID?: string;
}

/** Conteneur d'écran : zones sûres, fond du thème, bandeau hors ligne, rafraîchissement facultatif. */
export function Screen({
  children,
  scroll = false,
  onRefresh,
  refreshing = false,
  testID,
}: ScreenProps) {
  const theme = useTheme();
  const scrollable = scroll || onRefresh !== undefined;
  const content = scrollable ? (
    <ScrollView
      testID="screen-scroll"
      contentContainerStyle={styles.content}
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
    <View style={[styles.content, styles.fill]}>{children}</View>
  );
  return (
    <SafeAreaView
      testID={testID}
      style={[styles.fill, { backgroundColor: theme.colors.background }]}
    >
      <OfflineBanner />
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 16, gap: 16 },
});
