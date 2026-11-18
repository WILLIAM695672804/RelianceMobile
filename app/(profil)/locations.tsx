import { router } from 'expo-router';

import { LocationsScreen } from '@/features/profile';

export default function LocationsRoute() {
  return <LocationsScreen onBack={() => router.back()} />;
}
