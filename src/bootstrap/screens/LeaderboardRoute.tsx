import { router } from 'expo-router';

import { LeaderboardScreen } from '@/features/directory';

/** Classement des techniciens, relié à leur profil public. */
export function LeaderboardRoute() {
  return (
    <LeaderboardScreen
      onBack={() => router.back()}
      onOpen={(id) => router.push({ pathname: '/technicians/[id]', params: { id } })}
    />
  );
}
