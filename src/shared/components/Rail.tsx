import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';

import { useTheme } from '@/core/theme';

export interface RailProps {
  children: ReactNode;
  gap?: number;
  testID?: string;
}

/** Rangée défilant à l'horizontale, pour les séries de cartes. */
export function Rail({ children, gap, testID }: RailProps) {
  const theme = useTheme();
  return (
    <ScrollView
      testID={testID}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: gap ?? theme.spacing.md, paddingRight: theme.spacing.lg }}
    >
      {children}
    </ScrollView>
  );
}
