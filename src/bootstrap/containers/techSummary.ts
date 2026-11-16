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
  return cards.map((card, index) => {
    const lat = card.location?.latitude;
    const lng = card.location?.longitude;
    const mapPoint =
      lat != null && lng != null
        ? { x: scale(lng, minLng, maxLng), y: 100 - scale(lat, minLat, maxLat) }
        : { x: 20 + ((index * 37) % 60), y: 20 + ((index * 23) % 55) };
    return { ...toTechSummary(card), mapPoint };
  });
}
