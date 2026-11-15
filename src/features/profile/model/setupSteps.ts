/** Étapes du parcours d'installation, dans l'ordre de la maquette `TechOnboardingScreen`. */
export const SETUP_STEPS = ['professional', 'skills', 'zone', 'kyc', 'planning'] as const;
export type SetupStepKey = (typeof SETUP_STEPS)[number];

/** Éléments nécessaires pour juger l'avancement, tous issus de l'API. */
export interface SetupSnapshot {
  bio: string | null | undefined;
  skillCount: number;
  radiusKm: number | null | undefined;
  kycApproved: boolean;
  timeSlotCount: number;
}

export interface SetupStep {
  key: SetupStepKey;
  done: boolean;
}

/** Avancement de chaque étape ; aucune n'en bloque une autre. */
export function setupStepsFor(snapshot: SetupSnapshot): SetupStep[] {
  const done: Record<SetupStepKey, boolean> = {
    professional: (snapshot.bio ?? '').trim().length > 0,
    skills: snapshot.skillCount > 0,
    zone: (snapshot.radiusKm ?? 0) > 0,
    kyc: snapshot.kycApproved,
    planning: snapshot.timeSlotCount > 0,
  };
  return SETUP_STEPS.map((key) => ({ key, done: done[key] }));
}

/** Nombre d'étapes achevées. */
export function completedSteps(steps: readonly SetupStep[]): number {
  return steps.filter((step) => step.done).length;
}
