import { router } from 'expo-router';

import { RadarContainer } from '@/features/matching';

export default function RadarRoute() {
  return (
    <RadarContainer
      onBack={() => router.back()}
      onAccepted={() => router.replace('/technicien/mission')}
    />
  );
}
