import { router, useLocalSearchParams } from 'expo-router';

import { RatingContainer } from '@/features/reviews';

/** Notation du technicien sur une demande clôturée. */
export function ReviewRoute() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  return <RatingContainer requestId={requestId} onDone={() => router.back()} />;
}
