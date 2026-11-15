import { router, useLocalSearchParams } from 'expo-router';

import { useSession } from '@/core/session';
import { BadgeDetailScreen, ReputationScreen } from '@/features/reviews';

/** Réputation du technicien connecté, reliée au classement et au détail d'un badge. */
export function ReputationRoute() {
  const userId = useSession((state) => state.user?.id ?? '');
  return (
    <ReputationScreen
      userId={userId}
      onBack={() => router.back()}
      onOpenBadge={(code) => router.push({ pathname: '/badges/[code]', params: { code } })}
      onOpenLeaderboard={() => router.push('/leaderboard')}
    />
  );
}

/** Détail d'un badge du catalogue. */
export function BadgeDetailRoute() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const userId = useSession((state) => state.user?.id ?? '');
  return <BadgeDetailScreen code={code} userId={userId} onBack={() => router.back()} />;
}
