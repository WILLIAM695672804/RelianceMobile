import type { TechnicianCard } from '@/features/directory';
import type { TechSummary } from '@/shared/model';

/** Fiche d'annuaire réduite au résumé des cartes et listes de la refonte. */
export function toTechSummary(card: TechnicianCard): TechSummary {
  const skill = card.skills[0];
  return {
    id: card.id,
    name: card.name,
    skill: skill?.category ?? skill?.name ?? '',
    rating: card.rating ?? null,
    jobs: card.num_reviews ?? null,
    distanceKm: card.distance_km ?? null,
    etaMin: null,
    price: skill?.hourly_rate ?? null,
    verified: Boolean(card.verified ?? card.kyc_approved),
    coordinates:
      card.location?.latitude != null && card.location?.longitude != null
        ? { latitude: card.location.latitude, longitude: card.location.longitude }
        : undefined,
  };
}

/**
 * Place les techniciens sur la carte illustrée : coordonnées réelles ramenées au cadre
 * lorsqu'elles existent, disposition régulière sinon.
 */
export function withMapPoints(cards: readonly TechnicianCard[]): TechSummary[] {
  const located = cards.filter(
    (card) => card.location?.latitude != null && card.location?.longitude != null,
  );
  const lats = located.map((card) => card.location!.latitude!);
  const lngs = located.map((card) => card.location!.longitude!);
  const [minLat, maxLat, minLng, maxLng] = [
    Math.min(...lats),
    Math.max(...lats),
    Math.min(...lngs),
    Math.max(...lngs),
  ];
  const scale = (value: number, min: number, max: number) =>
    max - min < 1e-6 ? 50 : 15 + ((value - min) / (max - min)) * 70;
  const points = cards.map((card, index) => {
    const lat = card.location?.latitude;
    const lng = card.location?.longitude;
    return lat != null && lng != null
      ? { x: scale(lng, minLng, maxLng), y: band(100 - scale(lat, minLat, maxLat)) }
      : { x: 20 + ((index * 37) % 60), y: band(20 + ((index * 23) % 55)) };
  });
  return spreadOverlaps(points).map((mapPoint, index) => ({
    ...toTechSummary(cards[index]!),
    mapPoint,
  }));
}

/**
 * Ramène l'ordonnée (15 à 85 %) dans la moitié haute du cadre (12 à 48 %) : les cartes
 * superposent leur panneau d'informations à la moitié basse, qui masquerait les repères.
 */
function band(y: number): number {
  return 12 + ((y - 15) * 36) / 70;
}

/** Rayon, en pourcentage du cadre, de la couronne des repères confondus. */
const OVERLAP_RADIUS = 9;

/**
 * Écarte en couronne les repères confondus (même adresse, ou données d'essai identiques) :
 * sans cela, ils se superposent et un seul reste visible.
 */
export function spreadOverlaps(
  points: readonly { x: number; y: number }[],
): { x: number; y: number }[] {
  const groups = new Map<string, number[]>();
  points.forEach((point, index) => {
    const key = `${Math.round(point.x)}:${Math.round(point.y)}`;
    groups.set(key, [...(groups.get(key) ?? []), index]);
  });
  const result = points.map((point) => ({ ...point }));
  for (const indexes of groups.values()) {
    if (indexes.length < 2) continue;
    indexes.forEach((pointIndex, rank) => {
      const angle = (2 * Math.PI * rank) / indexes.length;
      const origin = points[pointIndex]!;
      result[pointIndex] = {
        x: Math.min(95, Math.max(5, origin.x + OVERLAP_RADIUS * Math.cos(angle))),
        y: Math.min(95, Math.max(5, origin.y + OVERLAP_RADIUS * Math.sin(angle))),
      };
    });
  }
  return result;
}
