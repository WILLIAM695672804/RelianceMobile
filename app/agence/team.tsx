import { router } from 'expo-router';

import { MyTeamContainer } from '@/features/agency';

export default function AgencyTeamTab() {
  return (
    <MyTeamContainer
      withTabBar
      onBack={() => router.navigate('/agence')}
      onMember={(id) => router.push({ pathname: '/technicians/[id]', params: { id } })}
    />
  );
}
