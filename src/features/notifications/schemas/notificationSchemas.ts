import { z } from 'zod';

/** Canaux de notification gérés par le serveur. */
export const NOTIFICATION_CHANNELS = ['in_app', 'push', 'email', 'sms'] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

/** Notification en base (aucune ressource côté serveur : les colonnes sont exposées telles quelles). */
export const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string().nullish(),
  payload: z.record(z.string(), z.unknown()).nullish(),
  is_read: z.boolean(),
  read_at: z.string().nullish(),
  created_at: z.string().nullish(),
});
export type AppNotification = z.infer<typeof notificationSchema>;

/** `GET /notifications` : pagination Laravel brute (champs de page à la racine). */
export const notificationPageSchema = z.object({
  data: z.array(notificationSchema),
  current_page: z.number().nullish(),
  last_page: z.number().nullish(),
  total: z.number().nullish(),
});

export const unreadCountSchema = z.object({ count: z.number() });

export const notificationSettingSchema = z.object({
  channel: z.string(),
  enabled: z.boolean(),
});
export type NotificationSetting = z.infer<typeof notificationSettingSchema>;

export const settingsResponseSchema = z.object({ data: z.array(notificationSettingSchema) });

/** Préférences par canal ; un canal absent est considéré comme actif. */
export type ChannelMap = Record<NotificationChannel, boolean>;

export function toChannelMap(settings: NotificationSetting[]): ChannelMap {
  const map = Object.fromEntries(
    NOTIFICATION_CHANNELS.map((channel) => [channel, true]),
  ) as ChannelMap;
  for (const setting of settings) {
    if ((NOTIFICATION_CHANNELS as readonly string[]).includes(setting.channel)) {
      map[setting.channel as NotificationChannel] = setting.enabled;
    }
  }
  return map;
}

export const messageResponseSchema = z.object({ message: z.string() });
