import { router } from 'expo-router';

import { MissionCockpitScreen } from '@/features/missions';

/** Onglet « Mission » du technicien : cockpit relié à l'historique et aux devis. */
export function MissionRoute() {
  return (
    <MissionCockpitScreen
      onOpenHistory={() => router.push('/jobs')}
      onOpenQuotes={(requestId) =>
        router.push({ pathname: '/quotes/[requestId]', params: { requestId } })
      }
    />
  );
}
