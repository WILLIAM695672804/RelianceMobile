import { router, useLocalSearchParams } from 'expo-router';

import { RequestDetailScreen } from '@/features/requests';

export default function RequestDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <RequestDetailScreen
      requestId={id}
      onFindTechnicians={() => router.push({ pathname: '/requests/[id]/matching', params: { id } })}
      onReview={(requestId) =>
        router.push({ pathname: '/reviews/new/[requestId]', params: { requestId } })
      }
    />
  );
}
