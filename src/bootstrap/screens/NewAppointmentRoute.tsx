import { router, useLocalSearchParams } from 'expo-router';

import { NewAppointmentScreen } from '@/features/planning';

/** Planification d'un rendez-vous pour une demande attribuée. */
export function NewAppointmentRoute() {
  const { requestId, technicianId } = useLocalSearchParams<{
    requestId: string;
    technicianId: string;
  }>();
  return (
    <NewAppointmentScreen
      requestId={requestId}
      technicianId={technicianId}
      onCreated={() => router.back()}
    />
  );
}
