import { router } from 'expo-router';

import { MissionCockpitScreen } from '@/features/missions';

/** Onglet « Mission » du technicien : cockpit relié à l'historique, aux devis et à la messagerie. */
export function MissionRoute() {
  return (
    <MissionCockpitScreen
      onOpenHistory={() => router.push('/jobs')}
      onOpenQuotes={(requestId) =>
        router.push({ pathname: '/quotes/[requestId]', params: { requestId } })
      }
      onContact={(userId) =>
        router.push({ pathname: '/conversations/new', params: { member: userId } })
      }
      onPlanAppointment={(requestId, technicianId) =>
        router.push({ pathname: '/appointments/new', params: { requestId, technicianId } })
      }
      onOpenReport={(jobId, requestId) =>
        router.push({ pathname: '/reports/[jobId]', params: { jobId, requestId } })
      }
      onCancel={(jobId) => router.push({ pathname: '/cancel/[jobId]', params: { jobId } })}
    />
  );
}
