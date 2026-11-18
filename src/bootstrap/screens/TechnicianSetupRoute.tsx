import { router } from 'expo-router';

import { TechOnboardingContainer } from '@/features/profile';

/** Installation du technicien, ouverte depuis le compte ou après le dépôt des pièces. */
export function TechnicianSetupRoute() {
  return (
    <TechOnboardingContainer
      onBack={() => router.back()}
      onDone={() => router.dismissTo('/technicien')}
    />
  );
}
