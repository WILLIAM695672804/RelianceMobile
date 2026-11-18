import { router, useLocalSearchParams } from 'expo-router';

import { RequestDetailScreen } from '@/features/requests';

/** Détail d'une demande : rapprochement, rapport, contrôle qualité, avis et litige. */
export function RequestDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <RequestDetailScreen
      requestId={id}
      onFindTechnicians={() => router.push({ pathname: '/requests/[id]/matching', params: { id } })}
      onReview={(requestId) =>
        router.push({ pathname: '/reviews/new/[requestId]', params: { requestId } })
      }
      onOpenReport={(requestId) =>
        router.push({ pathname: '/requests/[id]/report', params: { id: requestId } })
      }
      onOpenQuality={(requestId, technicianId) =>
        router.push({
          pathname: '/requests/[id]/quality',
          params: { id: requestId, technicianId },
        })
      }
      onOpenDispute={(requestId, against) =>
        router.push({ pathname: '/disputes/new', params: { requestId, against } })
      }
      onBack={() => router.back()}
    />
  );
}
