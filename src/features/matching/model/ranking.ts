/** RG-MAT-03 : cinq techniciens proposés au plus. */
export const MAX_PROPOSED_TECHNICIANS = 5;

/** RG-MAT-02 : classement par score de compatibilité décroissant. */
export function rankTechnicians<T extends { match_score: number }>(technicians: T[]): T[] {
  return [...technicians]
    .sort((left, right) => right.match_score - left.match_score)
    .slice(0, MAX_PROPOSED_TECHNICIANS);
}
