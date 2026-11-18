/**
 * Feature `notifications` — centre de notifications (E23) et préférences de canaux.
 * @packageDocumentation
 */

export { notificationsKeys } from './hooks/notificationsKeys';
export {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useNotificationSettings,
  useNotificationsSync,
  useUnreadNotificationCount,
  useUpdateNotificationSettings,
} from './hooks/useNotifications';
export { notificationsTranslations } from './i18n';
export { NotificationSettingsScreen } from './screens/NotificationSettingsScreen';
export { NotificationsScreen, type NotificationsScreenProps } from './screens/NotificationsScreen';
export type {
  AppNotification,
  ChannelMap,
  NotificationChannel,
} from './schemas/notificationSchemas';
export {
  categoryOf,
  elapsedOf,
  groupByPeriod,
  type NotificationCategory,
} from './model/notificationGroups';
export { NotificationsView, type NotificationsViewProps } from './ui/NotificationsView';
export {
  NotificationSettingsView,
  type NotificationSettingsViewProps,
} from './ui/NotificationSettingsView';
export { notificationTarget, type NotificationTarget } from './model/notificationTarget';
export {
  NotificationsContainer,
  type NotificationsContainerProps,
} from './containers/NotificationsContainer';
