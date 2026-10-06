import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { Badge, Button, Card, Screen, StateView, Text } from '@/shared/components';
import { formatDate } from '@/shared/format';

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '../hooks/useNotifications';
import type { AppNotification } from '../schemas/notificationSchemas';

export interface NotificationsScreenProps {
  /** Ouverture des préférences de notification. */
  onOpenSettings: () => void;
}

/** E23 — Centre de notifications. */
export function NotificationsScreen({ onOpenSettings }: NotificationsScreenProps) {
  const { t } = useTranslation();
  const notifications = useNotifications();
  const unread = useUnreadNotificationCount();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<unknown>, success: string) => {
    setNotice(null);
    setError(null);
    try {
      await action();
      setNotice(success);
    } catch (cause) {
      setError(describeError(normalizeError(cause), t));
    }
  };

  const refresh = () => {
    void notifications.refetch();
    void unread.refetch();
  };

  const renderNotification = (notification: AppNotification) => (
    <Card key={notification.id}>
      <Text variant="subtitle">{notification.title}</Text>
      {notification.body ? <Text>{notification.body}</Text> : null}
      {notification.created_at ? (
        <Text variant="caption" tone="muted">
          {t('notifications:receivedAt', { date: formatDate(notification.created_at) })}
        </Text>
      ) : null}
      {notification.is_read ? null : (
        <Button
          label={t('notifications:markOne', { title: notification.title })}
          accessibilityLabel={t('notifications:markOne', { title: notification.title })}
          onPress={() =>
            void run(() => markOne.mutateAsync(notification.id), t('notifications:marked'))
          }
          disabled={markOne.isPending}
          variant="secondary"
        />
      )}
    </Card>
  );

  const renderList = () => {
    if (notifications.isPending) return <StateView status="loading" />;
    if (notifications.isError) {
      return (
        <StateView
          status="error"
          error={notifications.error}
          onRetry={() => void notifications.refetch()}
        />
      );
    }
    if (notifications.data.notifications.length === 0) {
      return <StateView status="empty" message={t('notifications:empty')} />;
    }
    return notifications.data.notifications.map(renderNotification);
  };

  return (
    <Screen onRefresh={refresh} refreshing={notifications.isRefetching}>
      <Text variant="title" accessibilityRole="header">
        {t('notifications:title')}
      </Text>
      {unread.isSuccess ? (
        unread.data > 0 ? (
          <Badge label={t('notifications:unread', { count: unread.data })} tone="warning" />
        ) : (
          <Text tone="muted">{t('notifications:allRead')}</Text>
        )
      ) : null}
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      <Button
        label={t('notifications:markAll')}
        onPress={() => void run(() => markAll.mutateAsync(), t('notifications:allMarked'))}
        loading={markAll.isPending}
        variant="secondary"
      />
      <Button label={t('notifications:openSettings')} onPress={onOpenSettings} variant="ghost" />
      {renderList()}
    </Screen>
  );
}
