import { router, useLocalSearchParams } from 'expo-router';

import { QualityControlScreen } from '@/features/missions';

/** Contrôle qualité du client : relie le rapport, l'avis et le litige. */
export function QualityControlRoute() {
  const { id, technicianId } = useLocalSearchParams<{ id: string; technicianId: string }>();
  return (
    <QualityControlScreen
      requestId={id}
      technicianId={technicianId}
      onBack={() => router.back()}
      onRate={(requestId) =>
        router.replace({ pathname: '/reviews/new/[requestId]', params: { requestId } })
      }
      onOpenDispute={(requestId, against) =>
        router.push({ pathname: '/disputes/new', params: { requestId, against } })
      }
      onDone={() => router.back()}
    />
  );
}
