import { router } from 'expo-router';

import { NotificationsScreen } from '@/features/notifications';

/** Centre de notifications relié aux préférences. */
export function NotificationsRoute() {
  return <NotificationsScreen onOpenSettings={() => router.push('/notification-settings')} />;
}
