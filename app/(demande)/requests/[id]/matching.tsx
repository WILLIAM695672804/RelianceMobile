import { router, useLocalSearchParams } from 'expo-router';

import { MatchingContainer } from '@/features/matching';

export default function MatchingRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <MatchingContainer
      requestId={id}
      onSent={() => router.dismissTo({ pathname: '/requests/[id]', params: { id } })}
      onViewProfile={(technicianId) =>
        router.push({
          pathname: '/requests/[id]/technicians/[technicianId]',
          params: { id, technicianId },
        })
      }
      onClose={() => router.back()}
    />
  );
}
