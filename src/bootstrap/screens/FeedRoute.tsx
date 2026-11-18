import { router } from 'expo-router';

import { FeedContainer } from '@/features/social';

/** Fil social relié au détail d'une publication et à la rédaction. */
export function FeedRoute() {
  return (
    <FeedContainer
      onOpen={(id) => router.push({ pathname: '/posts/[id]', params: { id } })}
      onCompose={() => router.push('/compose')}
      onBack={() => router.back()}
    />
  );
}
