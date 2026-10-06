import { router } from 'expo-router';

import { PlanningScreen } from '@/features/planning';

/** Planning du technicien relié aux créneaux, indisponibilités et rendez-vous. */
export function PlanningRoute() {
  return (
    <PlanningScreen
      onOpenSlots={() => router.push('/planning/time-slots')}
      onOpenExceptions={() => router.push('/planning/exceptions')}
      onOpenAppointments={() => router.push('/appointments')}
    />
  );
}
