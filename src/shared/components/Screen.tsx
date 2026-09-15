import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/core/theme';

import { OfflineBanner } from './OfflineBanner';

export interface ScreenProps {
  children: ReactNode;
  /** Contenu défilant (formulaires, listes courtes). */
  scroll?: boolean;
  testID?: string;
}

/** Conteneur d'écran : zones sûres, fond du thème, bandeau hors ligne. */
export function Screen({ children, scroll = false, testID }: ScreenProps) {
  const theme = useTheme();
  const content = scroll ? (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
