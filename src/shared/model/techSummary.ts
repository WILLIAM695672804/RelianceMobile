/**
 * Fiche résumée d'un technicien, telle que la présentent l'accueil, la carte et le
 * rapprochement (maquette `TECHS`). Les conteneurs la construisent à partir de l'annuaire.
 */
export interface TechSummary {
  id: string;
  name: string;
  /** Métier principal (« Plomberie »). */
  skill: string;
  rating: number | null;
  /** Nombre de missions réalisées. */
  jobs: number | null;
  distanceKm: number | null;
  /** Délai d'arrivée estimé, en minutes. */
  etaMin: number | null;
  /** Tarif du diagnostic, en FCFA. */
  price: number | null;
  verified: boolean;
  /** Couleur de l'avatar ; à défaut, l'accent du thème. */
  color?: string;
  /** Position sur une carte illustrée, en pourcentage du cadre. */
  mapPoint?: { x: number; y: number };
  /** Position géographique connue (carte réelle). */
  coordinates?: { latitude: number; longitude: number };
}

/** « ⭐ 4,9 · 1,2 km · 18 min », en omettant les éléments inconnus. */
export function techFacts(
  tech: TechSummary,
  format: { rating: (value: number) => string; distance: (km: number) => string },
): string {
  return [
    tech.rating != null ? `★ ${format.rating(tech.rating)}` : null,
    tech.distanceKm != null ? format.distance(tech.distanceKm) : null,
    tech.etaMin != null ? `${tech.etaMin} min` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}
