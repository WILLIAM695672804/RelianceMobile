import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import notificationRead from '@/test/fixtures/notifications/notification-read.json';
import notifications from '@/test/fixtures/notifications/notifications.json';
import readAll from '@/test/fixtures/notifications/read-all.json';
import settings from '@/test/fixtures/notifications/settings.json';
import settingsUpdated from '@/test/fixtures/notifications/settings-updated.json';
import unreadCount from '@/test/fixtures/notifications/unread-count.json';

import {
  fetchNotifications,
  fetchNotificationSettings,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationSettings,
} from './notificationsApi';

const NOTIFICATION_ID = notifications.data[0]!.id;

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('notificationsApi', () => {
  it('lit les notifications, le compteur et les préférences', async () => {
    const { client, mock } = setup();
    mock.onGet('/notifications').reply(200, notifications);
    mock.onGet('/notifications/unread-count').reply(200, unreadCount);
    mock.onGet('/notification-settings').reply(200, settings);

    await expect(fetchNotifications(client)).resolves.toMatchObject({ total: notifications.total });
    await expect(fetchUnreadCount(client)).resolves.toBe(unreadCount.count);
    await expect(fetchNotificationSettings(client)).resolves.toMatchObject({ in_app: true });
  });

  it('marque une notification puis toutes comme lues', async () => {
    const { client, mock } = setup();
    mock.onPost(`/notifications/${NOTIFICATION_ID}/read`).reply(200, notificationRead);
    mock.onPost('/notifications/read-all').reply(200, readAll);

    await expect(markNotificationRead(client, NOTIFICATION_ID)).resolves.toBe(
      notificationRead.message,
    );
    await expect(markAllNotificationsRead(client)).resolves.toBe(readAll.message);
  });

  it('enregistre les préférences de canaux', async () => {
    const { client, mock } = setup();
    mock.onPut('/notification-settings').reply(200, settingsUpdated);

    const updated = await updateNotificationSettings(client, {
      in_app: true,
      push: false,
      email: true,
      sms: false,
    });

    expect(updated.push).toBe(false);
    expect(JSON.parse(mock.history.put[0]?.data as string)).toEqual({
      in_app: true,
      push: false,
      email: true,
      sms: false,
    });
  });
});
