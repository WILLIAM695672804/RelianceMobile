import { router } from 'expo-router';

import { TechnicianStatsScreen } from '@/features/profile';

export default function ActiviteRoute() {
  return <TechnicianStatsScreen onBack={() => router.back()} />;
}
