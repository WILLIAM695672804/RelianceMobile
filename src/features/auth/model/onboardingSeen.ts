import type { KeyValueStore } from '@/core/storage';

const KEY = 'auth.onboarding.seen';
const SEEN = '1';

export interface OnboardingFlag {
  /** Vrai dès que le fil d'accueil a été parcouru ou passé. */
  seen: () => boolean;
  markSeen: () => void;
}

/**
 * Retient que le fil d'accueil a été vu. Le stockage des préférences survit à la
 * déconnexion : le fil ne doit reparaître à aucune session suivante.
 */
export function createOnboardingFlag(store: KeyValueStore): OnboardingFlag {
  return {
    seen: () => store.getString(KEY) === SEEN,
    markSeen: () => store.set(KEY, SEEN),
  };
}
