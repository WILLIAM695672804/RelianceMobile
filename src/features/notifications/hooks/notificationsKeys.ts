/** Clés de cache de la feature `notifications`. */
export const notificationsKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationsKeys.all, 'list'] as const,
  unreadCount: () => [...notificationsKeys.all, 'unread-count'] as const,
  settings: () => [...notificationsKeys.all, 'settings'] as const,
};
