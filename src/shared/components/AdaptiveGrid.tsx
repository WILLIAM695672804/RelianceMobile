import { Children, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useResponsive } from '@/core/responsive';
import { useTheme } from '@/core/theme';

export interface AdaptiveGridProps {
  children: ReactNode;
  /** Largeur minimale d'une tuile ; détermine le nombre de colonnes. */
  minTileWidth?: number;
  /** Plafond du nombre de colonnes, utile pour les grilles à deux colonnes imposées. */
  maxColumns?: number;
  gap?: number;
  testID?: string;
}

/**
 * Grille dont le nombre de colonnes se déduit de la largeur utile. Les lignes
 * incomplètes sont comblées par des cellules vides, afin que la dernière tuile
 * conserve la largeur des autres.
 */
export function AdaptiveGrid({
  children,
  minTileWidth = 104,
  maxColumns,
  gap,
  testID,
}: AdaptiveGridProps) {
  const theme = useTheme();
  const { columns } = useResponsive();
  const spacing = gap ?? theme.spacing.md;
  const perRow = columns(minTileWidth, spacing, maxColumns);
  const items = Children.toArray(children);
  const rows: ReactNode[][] = [];
  for (let index = 0; index < items.length; index += perRow) {
    rows.push(items.slice(index, index + perRow));
  }

  return (
    <View testID={testID} style={{ gap: spacing }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap: spacing }]}>
          {row.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.cell}>
              {item}
            </View>
          ))}
          {Array.from({ length: perRow - row.length }, (_, fillerIndex) => (
            <View key={`filler-${fillerIndex}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch' },
  cell: { flex: 1 },
});
