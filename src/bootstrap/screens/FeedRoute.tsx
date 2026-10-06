import { router } from 'expo-router';

import { FeedScreen } from '@/features/social';

/** Fil social relié au détail d'une publication. */
export function FeedRoute() {
  return <FeedScreen onOpen={(id) => router.push({ pathname: '/posts/[id]', params: { id } })} />;
}
