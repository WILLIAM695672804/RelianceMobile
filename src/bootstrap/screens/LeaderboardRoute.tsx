import { router } from 'expo-router';

import { useSession } from '@/core/session';

import { LeaderboardContainer } from '../containers/ReputationContainers';

/** Classement des techniciens, relié à leur profil public. */
export function LeaderboardRoute() {
  const selfId = useSession((state) => state.user?.id ?? null);
  return (
    <LeaderboardContainer
      selfId={selfId}
      onBack={() => router.back()}
      onOpen={(id) => router.push({ pathname: '/technicians/[id]', params: { id } })}
    />
  );
}
