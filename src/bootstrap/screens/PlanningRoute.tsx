import { router } from 'expo-router';

import { PlanningWeekContainer } from '@/features/planning';

/** Semaine du technicien, reliée au blocage d'agenda et aux disponibilités. */
export function PlanningRoute() {
  return (
    <PlanningWeekContainer
      onBack={() => router.back()}
      onBlock={() => router.push('/planning/exceptions')}
      onAvailability={() => router.push('/planning/time-slots')}
      onAppointments={() => router.push('/appointments')}
    />
  );
}
