import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';
import { channels, useChannelEvent } from '@/core/realtime';
import { useSession } from '@/core/session';

import {
  fetchNotifications,
  fetchNotificationSettings,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationSettings,
} from '../api/notificationsApi';
import type { ChannelMap } from '../schemas/notificationSchemas';
import { notificationsKeys } from './notificationsKeys';

export function useNotifications() {
  const api = useApiClient();
  return useQuery({
    queryKey: notificationsKeys.list(),
    queryFn: () => fetchNotifications(api),
  });
}

export function useUnreadNotificationCount() {
  const api = useApiClient();
  return useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: () => fetchUnreadCount(api),
  });
}

export function useNotificationSettings() {
  const api = useApiClient();
  return useQuery({
    queryKey: notificationsKeys.settings(),
    queryFn: () => fetchNotificationSettings(api),
  });
}

/** Toute écriture recharge la liste, le compteur et les préférences. */
function useNotificationsInvalidation() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
}

export function useMarkNotificationRead() {
  const api = useApiClient();
  const invalidate = useNotificationsInvalidation();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(api, notificationId),
    onSuccess: invalidate,
  });
}

export function useMarkAllNotificationsRead() {
  const api = useApiClient();
  const invalidate = useNotificationsInvalidation();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(api),
    onSuccess: invalidate,
  });
}

export function useUpdateNotificationSettings() {
  const api = useApiClient();
  const invalidate = useNotificationsInvalidation();
  return useMutation({
    mutationFn: (preferences: ChannelMap) => updateNotificationSettings(api, preferences),
    onSuccess: invalidate,
  });
}

/** Canal `notifications.{userId}` : une notification reçue recharge la liste et le compteur. */
export function useNotificationsSync() {
  const userId = useSession((state) => state.user?.id ?? null);
  const queryClient = useQueryClient();
  const channel = userId ? channels.notifications(userId) : null;

  useChannelEvent(channel, 'NotificationCreated', () => {
    void queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
  });
}
