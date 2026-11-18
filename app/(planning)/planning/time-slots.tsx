import { router } from 'expo-router';

import { AvailabilityContainer } from '@/features/planning';

export default function TimeSlotsRoute() {
  return <AvailabilityContainer onBack={() => router.back()} />;
}
