import notifications from '@/test/fixtures/notifications/notifications.json';
import settings from '@/test/fixtures/notifications/settings.json';
import settingsUpdated from '@/test/fixtures/notifications/settings-updated.json';
import unreadCount from '@/test/fixtures/notifications/unread-count.json';

import {
  notificationPageSchema,
  settingsResponseSchema,
  toChannelMap,
  unreadCountSchema,
} from './notificationSchemas';

describe('notificationSchemas', () => {
  it('lit la pagination brute des notifications', () => {
    const page = notificationPageSchema.parse(notifications);

    expect(page.data).toHaveLength(notifications.data.length);
    expect(page.total).toBe(notifications.total);
    expect(page.data[0]?.title).toBe(notifications.data[0]!.title);
    expect(page.data[0]?.is_read).toBe(notifications.data[0]!.is_read);
  });

  it('lit le compteur de non-lues', () => {
    expect(unreadCountSchema.parse(unreadCount).count).toBe(unreadCount.count);
  });

  it('lit les préférences de canaux et les projette en table', () => {
    const list = settingsResponseSchema.parse(settings).data;
    expect(list).toHaveLength(settings.data.length);

    const map = toChannelMap(settingsResponseSchema.parse(settingsUpdated).data);
    expect(map.in_app).toBe(true);
    expect(map.push).toBe(false);
    expect(map.sms).toBe(false);
  });

  it('considère un canal absent comme actif', () => {
    expect(toChannelMap([{ channel: 'email', enabled: false }])).toEqual({
      in_app: true,
      push: true,
      email: false,
      sms: true,
    });
  });
});
