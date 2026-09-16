import { router, useLocalSearchParams } from 'expo-router';

import { MatchingScreen } from '@/features/matching';

export default function MatchingRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <MatchingScreen
      requestId={id}
      onSelect={(technicianId) =>
        router.push({
          pathname: '/requests/[id]/technicians/[technicianId]',
          params: { id, technicianId },
        })
      }
    />
  );
}
