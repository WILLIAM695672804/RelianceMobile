import { router } from 'expo-router';

import { ClientTrackingContainer } from '@/features/missions';

/** Suivi client : messagerie avec le technicien, devis et contrôle qualité. */
export function ClientTrackingRoute() {
  return (
    <ClientTrackingContainer
      onBack={() => router.back()}
      onChat={(member, subject) =>
        router.push({ pathname: '/conversations/new', params: { member, subject } })
      }
      onOpenQuotes={(requestId) =>
        router.push({ pathname: '/quotes/[requestId]', params: { requestId } })
      }
      onOpenQuality={(id, technicianId) =>
        router.push({ pathname: '/requests/[id]/quality', params: { id, technicianId } })
      }
    />
  );
}
