import { router } from 'expo-router';

import { TechnicianSkillsScreen } from '@/features/profile';

export default function SkillsRoute() {
  return <TechnicianSkillsScreen onBack={() => router.back()} />;
}
