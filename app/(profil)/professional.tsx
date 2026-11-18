import { router } from 'expo-router';

import { TechnicianProfileScreen } from '@/features/profile';

export default function ProfessionalRoute() {
  return <TechnicianProfileScreen onBack={() => router.back()} />;
}
