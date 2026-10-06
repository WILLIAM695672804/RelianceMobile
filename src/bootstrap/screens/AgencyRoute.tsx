import { router } from 'expo-router';

import { AgencyScreen } from '@/features/agency';

/** Onglet « Agence » : fiche de l'agence reliée à son équipe. */
export function AgencyRoute() {
  return (
    <AgencyScreen
      onOpenTeam={(id) => router.push({ pathname: '/agency/team/[id]', params: { id } })}
    />
  );
}
