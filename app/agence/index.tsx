import { router } from 'expo-router';

import { AgencyHomeContainer } from '@/features/agency';

export default function AgencyHomeRoute() {
  return (
    <AgencyHomeContainer
      onTeam={() => router.navigate('/agence/team')}
      onMember={(id) => router.push({ pathname: '/technicians/[id]', params: { id } })}
      onManage={(id) => router.push({ pathname: '/agency/team/[id]', params: { id } })}
    />
  );
}
