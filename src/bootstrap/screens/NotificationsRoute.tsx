import { router, type Href } from 'expo-router';

import type { Role } from '@/core/session';
import { useSession } from '@/core/session';
import { NotificationsContainer, type NotificationTarget } from '@/features/notifications';

/** Écran ouvert pour une destination de notification, selon le rôle connecté. */
export function hrefForTarget(target: NotificationTarget, role: Role | null): Href {
  switch (target.kind) {
    case 'conversation':
      return { pathname: '/conversations/[id]', params: { id: target.id } };
    case 'request':
      return { pathname: '/requests/[id]', params: { id: target.id } };
    case 'mission':
      return '/technicien/mission';
    case 'proposals':
      return '/technicien';
    case 'wallet':
      if (role === 'client') return '/client/wallet';
      if (role === 'technicien') return '/technicien/wallet';
      return '/wallet';
  }
}

/** Centre de notifications : chaque notification mène à l'écran qu'elle concerne. */
export function NotificationsRoute() {
  const role = useSession((state) => state.user?.role ?? null);
  return (
    <NotificationsContainer
      onBack={() => router.back()}
      onNavigate={(target) => router.push(hrefForTarget(target, role))}
    />
  );
}
