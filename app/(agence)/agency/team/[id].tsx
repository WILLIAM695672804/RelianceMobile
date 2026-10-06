import { useLocalSearchParams } from 'expo-router';

import { AgencyTeamScreen } from '@/features/agency';

export default function AgencyTeamRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AgencyTeamScreen agencyId={id} />;
}
