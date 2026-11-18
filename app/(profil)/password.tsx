import { router } from 'expo-router';

import { ChangePasswordScreen } from '@/features/profile';

export default function ChangePasswordRoute() {
  return <ChangePasswordScreen onDone={() => router.back()} onBack={() => router.back()} />;
}
