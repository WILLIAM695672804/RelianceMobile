import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import {
  columnsFor,
  gutterFor,
  maxContentWidthFor,
  sizeClassOf,
  typeScaleFor,
  type SizeClass,
} from './breakpoints';

export interface Responsive {
  width: number;
  height: number;
  sizeClass: SizeClass;
  landscape: boolean;
  /** Au moins une tablette : met en page sur deux colonnes lorsque c'est pertinent. */
  wide: boolean;
  /** Marge latérale de l'écran. */
  gutter: number;
  /** Largeur de contenu bornée, ou `undefined` sur téléphone. */
  maxContentWidth: number | undefined;
  /** Facteur de l'échelle typographique. */
  typeScale: number;
  /** Colonnes tenant dans la largeur utile pour une tuile d'au moins `minTileWidth`. */
  columns: (minTileWidth: number, gap?: number, cap?: number) => number;
}

/** Mesures adaptatives de la fenêtre courante. Se recalcule à la rotation et au redimensionnement. */
export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();
  return useMemo(() => {
    const sizeClass = sizeClassOf(width);
    const gutter = gutterFor(sizeClass);
    const maxContentWidth = maxContentWidthFor(sizeClass);
    const usable = Math.min(width, maxContentWidth ?? width) - gutter * 2;
    return {
      width,
      height,
      sizeClass,
      landscape: width > height,
      wide: sizeClass === 'expanded' || sizeClass === 'large',
      gutter,
      maxContentWidth,
      typeScale: typeScaleFor(sizeClass),
      columns: (minTileWidth, gap = 12, cap) => columnsFor(usable, minTileWidth, gap, cap),
    };
  }, [width, height]);
}
