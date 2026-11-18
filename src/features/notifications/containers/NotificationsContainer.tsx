import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import { useNow } from '@/shared/hooks';
import { useToast } from '@/shared/ui';

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/useNotifications';
import { notificationTarget, type NotificationTarget } from '../model/notificationTarget';
import { NotificationsView } from '../ui/NotificationsView';

export interface NotificationsContainerProps {
  onBack: () => void;
  onNavigate: (target: NotificationTarget) => void;
}

/** Centre de notifications : liste, lecture unitaire au toucher, lecture globale. */
export function NotificationsContainer({ onBack, onNavigate }: NotificationsContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const now = useNow();
  const role = useSession((state) => state.user?.role ?? null);
  const notifications = useNotifications();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const fail = (error: unknown) =>
    toast.show({ kind: 'error', title: describeError(normalizeError(error), t) });

  const status = notifications.isPending ? 'loading' : notifications.isError ? 'error' : 'ready';

  return (
    <NotificationsView
      status={status}
      notifications={notifications.data?.notifications ?? []}
      now={new Date(now)}
      errorKind={notifications.isError ? normalizeError(notifications.error).kind : undefined}
      markingAll={markAll.isPending}
      onBack={onBack}
      onRetry={() => void notifications.refetch()}
      onMarkAll={() => markAll.mutate(undefined, { onError: fail })}
      onOpen={(notification) => {
        if (!notification.is_read) markOne.mutate(notification.id, { onError: fail });
        const target = notificationTarget(
          notification,
          role === 'client' || role === 'technicien' || role === 'agence' ? role : null,
        );
        if (target) onNavigate(target);
      }}
    />
  );
}
