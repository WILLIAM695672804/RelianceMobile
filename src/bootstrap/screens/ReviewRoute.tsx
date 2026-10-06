import { router, useLocalSearchParams } from 'expo-router';

import { ReviewFormScreen } from '@/features/reviews';

/** Dépôt d'un avis sur une demande clôturée. */
export function ReviewRoute() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  return <ReviewFormScreen requestId={requestId} onDone={() => router.back()} />;
}
