import { router, type Href } from 'expo-router';

import { TechnicianSetupScreen, type SetupStepKey } from '@/features/profile';

/** Chaque étape du parcours mène à l'écran qui la traite. */
const STEP_HREF: Record<SetupStepKey, Href> = {
  professional: '/professional',
  skills: '/skills',
  zone: '/zone',
  kyc: '/kyc',
  planning: '/planning/time-slots',
};

/** Parcours d'installation du technicien, ouvert depuis le compte ou après le dépôt des pièces. */
export function TechnicianSetupRoute() {
  return (
    <TechnicianSetupScreen
      onBack={() => router.back()}
      onOpen={(step) => router.push(STEP_HREF[step])}
    />
  );
}
