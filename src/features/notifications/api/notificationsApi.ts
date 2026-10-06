import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import {
  messageResponseSchema,
  notificationPageSchema,
  settingsResponseSchema,
  toChannelMap,
  unreadCountSchema,
  type AppNotification,
  type ChannelMap,
} from '../schemas/notificationSchemas';

const segment = encodeURIComponent;
const message = (data: unknown): string => parseResponse(messageResponseSchema, data).message;

export interface NotificationsResult {
  notifications: AppNotification[];
  total: number | null;
}

/** `GET /notifications` : première page, les plus récentes d'abord. */
export async function fetchNotifications(client: AxiosInstance): Promise<NotificationsResult> {
  const { data } = await client.get('/notifications');
  const page = parseResponse(notificationPageSchema, data);
  return { notifications: page.data, total: page.total ?? null };
}

/** `GET /notifications/unread-count`. */
export async function fetchUnreadCount(client: AxiosInstance): Promise<number> {
  const { data } = await client.get('/notifications/unread-count');
  return parseResponse(unreadCountSchema, data).count;
}

/** `POST /notifications/{id}/read`. */
export async function markNotificationRead(
  client: AxiosInstance,
  notificationId: string,
): Promise<string> {
  const { data } = await client.post(`/notifications/${segment(notificationId)}/read`);
  return message(data);
}

/** `POST /notifications/read-all`. */
export async function markAllNotificationsRead(client: AxiosInstance): Promise<string> {
  const { data } = await client.post('/notifications/read-all');
  return message(data);
}

/** `GET /notification-settings` : préférences par canal. */
export async function fetchNotificationSettings(client: AxiosInstance): Promise<ChannelMap> {
  const { data } = await client.get('/notification-settings');
  return toChannelMap(parseResponse(settingsResponseSchema, data).data);
}

/** `PUT /notification-settings`. */
export async function updateNotificationSettings(
  client: AxiosInstance,
  channels: ChannelMap,
): Promise<ChannelMap> {
  const { data } = await client.put('/notification-settings', channels);
  return toChannelMap(parseResponse(settingsResponseSchema, data).data);
}
