import { router, useLocalSearchParams } from 'expo-router';

import { JobDetailScreen } from '@/features/missions';

export default function JobDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <JobDetailScreen jobId={id} onBack={() => router.back()} />;
}
