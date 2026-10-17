import { router, useLocalSearchParams } from 'expo-router';

import { CancelMissionScreen } from '@/features/missions';

/** Annulation d'une mission par le technicien, ouverte depuis le cockpit. */
export function CancelMissionRoute() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  return (
    <CancelMissionScreen
      jobId={jobId}
      onBack={() => router.back()}
      onDone={() => router.replace('/technicien/mission')}
    />
  );
}
