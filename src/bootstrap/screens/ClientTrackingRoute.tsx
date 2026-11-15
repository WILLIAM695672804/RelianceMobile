import { router } from 'expo-router';

import { MissionTrackingScreen } from '@/features/missions';

/** Onglet « Suivi » du client : E15 relié au rapport, au contrôle qualité et à la messagerie. */
export function ClientTrackingRoute() {
  return (
    <MissionTrackingScreen
      onOpenQuotes={(requestId) =>
        router.push({ pathname: '/quotes/[requestId]', params: { requestId } })
      }
      onContact={(userId) =>
        router.push({ pathname: '/conversations/new', params: { member: userId } })
      }
      onOpenReport={(requestId) =>
        router.push({ pathname: '/requests/[id]/report', params: { id: requestId } })
      }
    />
  );
}
