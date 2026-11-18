import { router } from 'expo-router';

import { EditProfileScreen } from '@/features/profile';

export default function EditProfileRoute() {
  return <EditProfileScreen onDone={() => router.back()} onBack={() => router.back()} />;
}
