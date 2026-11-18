import { router } from 'expo-router';

import { NotificationSettingsContainer } from '@/features/notifications';

export default function NotificationSettingsRoute() {
  return <NotificationSettingsContainer onBack={() => router.back()} />;
}
