export const REPUTATION_TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as const;
export type ReputationTier = (typeof REPUTATION_TIERS)[number];

/** Seuils repris de `RANK_TIERS` des maquettes. */
export const TIER_THRESHOLDS: Record<ReputationTier, number> = {
  bronze: 0,
  silver: 50,
  gold: 150,
  platinum: 300,
  diamond: 600,
};

/** Palier atteint ; un total négatif reste au premier palier. */
export function tierFor(points: number): ReputationTier {
  let reached: ReputationTier = 'bronze';
  for (const tier of REPUTATION_TIERS) {
    if (points >= TIER_THRESHOLDS[tier]) reached = tier;
  }
  return reached;
}

/**
 * Seuil du palier suivant, ou `null` au palier maximal. Un total négatif — les variations
 * de réputation peuvent retrancher des points — vaut zéro.
 */
export function nextTierPoints(points: number): number | null {
  const total = Math.max(0, points);
  const next = REPUTATION_TIERS.find((tier) => TIER_THRESHOLDS[tier] > total);
  return next === undefined ? null : TIER_THRESHOLDS[next];
}

/** Avancement vers le palier suivant, de 0 à 1 ; 1 au palier maximal. */
export function tierProgress(points: number): number {
  const total = Math.max(0, points);
  const next = nextTierPoints(total);
  if (next === null) return 1;
  const floor = TIER_THRESHOLDS[tierFor(total)];
  const span = next - floor;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (total - floor) / span));
}
