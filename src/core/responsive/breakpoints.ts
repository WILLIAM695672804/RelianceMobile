/**
 * Classes de taille de fenêtre. `medium`, `expanded` et `large` suivent les seuils
 * Material 3 (600 et 840 dp) ; `compact` isole les téléphones de moins de 360 dp,
 * fréquents sur le marché visé, où les grilles à trois colonnes deviennent illisibles.
 */
export const SIZE_CLASSES = ['compact', 'medium', 'expanded', 'large'] as const;

export type SizeClass = (typeof SIZE_CLASSES)[number];

export function sizeClassOf(width: number): SizeClass {
  if (width < 360) return 'compact';
  if (width < 600) return 'medium';
  if (width < 840) return 'expanded';
  return 'large';
}

/** Gouttières : 20 points sur téléphone standard, comme les maquettes Clean Lavender. */
const GUTTERS: Record<SizeClass, number> = {
  compact: 16,
  medium: 20,
  expanded: 24,
  large: 32,
};

/** Marge latérale d'un écran, en points. */
export function gutterFor(sizeClass: SizeClass): number {
  return GUTTERS[sizeClass];
}

/**
 * Nombre de colonnes tenant dans `available` points pour des tuiles d'au moins
 * `minTileWidth` points séparées de `gap`.
 */
export function columnsFor(
  available: number,
  minTileWidth: number,
  gap: number,
  cap?: number,
): number {
  const fitting = Math.floor((available + gap) / (minTileWidth + gap));
  const columns = Math.max(1, fitting);
  return cap === undefined ? columns : Math.min(columns, cap);
}

const MAX_CONTENT_WIDTHS: Record<SizeClass, number | undefined> = {
  compact: undefined,
  medium: undefined,
  expanded: 640,
  large: 720,
};

/** Largeur de contenu maximale, au-delà de laquelle le contenu est centré. */
export function maxContentWidthFor(sizeClass: SizeClass): number | undefined {
  return MAX_CONTENT_WIDTHS[sizeClass];
}

const TYPE_SCALES: Record<SizeClass, number> = {
  compact: 0.92,
  medium: 1,
  expanded: 1.08,
  large: 1.12,
};

/** Facteur appliqué à l'échelle typographique du thème. */
export function typeScaleFor(sizeClass: SizeClass): number {
  return TYPE_SCALES[sizeClass];
}

/**
 * Plafond de la mise à l'échelle demandée par le système : au-delà, les mises en page
 * se rompent. Le réglage d'accessibilité reste honoré jusqu'à ce seuil.
 */
export const MAX_FONT_SCALE = 1.4;

/** Cible tactile minimale recommandée par Material 3, en points. */
export const MIN_TOUCH_TARGET = 48;
