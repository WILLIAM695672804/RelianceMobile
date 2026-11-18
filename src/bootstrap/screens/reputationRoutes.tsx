import { router, useLocalSearchParams } from 'expo-router';

import { useSession } from '@/core/session';

import { BadgeContainer, ReputationContainer } from '../containers/ReputationContainers';

/** Réputation du technicien connecté, reliée au classement et au détail d'un badge. */
export function ReputationRoute() {
  const userId = useSession((state) => state.user?.id ?? '');
  const name = useSession((state) => state.user?.name ?? '');
  return (
    <ReputationContainer
      userId={userId}
      name={name}
      onBack={() => router.back()}
      onBadge={(code) => router.push({ pathname: '/badges/[code]', params: { code } })}
      onLeaderboard={() => router.push('/leaderboard')}
    />
  );
}

/** Détail d'un badge du catalogue. */
export function BadgeDetailRoute() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const userId = useSession((state) => state.user?.id ?? '');
  return <BadgeContainer code={code} userId={userId} onBack={() => router.back()} />;
}
