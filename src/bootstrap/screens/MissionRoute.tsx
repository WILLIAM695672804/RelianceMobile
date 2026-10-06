import { router } from 'expo-router';

import { MissionCockpitScreen } from '@/features/missions';

/** Onglet « Mission » du technicien : cockpit relié à l'historique du groupe `app/(missions)`. */
export function MissionRoute() {
  return <MissionCockpitScreen onOpenHistory={() => router.push('/jobs')} />;
}
