import { router } from 'expo-router';

import { ServiceAreaScreen } from '@/features/profile';

export default function ZoneRoute() {
  return <ServiceAreaScreen onBack={() => router.back()} />;
}
