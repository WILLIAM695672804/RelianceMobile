import type { TechnicianCard } from '../schemas/directorySchemas';

export interface RankedTechnician {
  /** Rang, à partir de 1. */
  rank: number;
  technician: TechnicianCard;
}

/**
 * Classement des techniciens. Aucun point d'API ne publie de palmarès de réputation :
 * l'ordre suit la note reçue, puis le nombre d'avis ; les techniciens non notés ferment
 * la marche.
 */
export function rankTechnicians(technicians: readonly TechnicianCard[]): RankedTechnician[] {
  return [...technicians]
    .sort((left, right) => {
      const ratingGap = (right.rating ?? -1) - (left.rating ?? -1);
      if (ratingGap !== 0) return ratingGap;
      return (right.num_reviews ?? 0) - (left.num_reviews ?? 0);
    })
    .map((technician, index) => ({ rank: index + 1, technician }));
}
