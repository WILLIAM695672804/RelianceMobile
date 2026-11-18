import { router } from 'expo-router';

import { TechnicianJobsScreen } from '@/features/missions';

/** Historique des missions relié au détail d'une mission. */
export function JobsRoute() {
  return (
    <TechnicianJobsScreen
      onOpen={(id) => router.push({ pathname: '/jobs/[id]', params: { id } })}
      onBack={() => router.back()}
    />
  );
}
