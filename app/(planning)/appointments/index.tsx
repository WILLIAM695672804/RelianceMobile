import { router } from 'expo-router';

import { AppointmentsScreen } from '@/features/planning';

export default function AppointmentsRoute() {
  return <AppointmentsScreen onBack={() => router.back()} />;
}
