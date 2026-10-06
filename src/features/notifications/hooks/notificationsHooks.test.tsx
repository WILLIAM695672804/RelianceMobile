import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import { createRealtimeService } from '@/core/realtime';
import { createSessionStore } from '@/core/session';
import { createFakeRealtimeClient } from '@/test/fakeRealtime';
import notificationRead from '@/test/fixtures/notifications/notification-read.json';
import notifications from '@/test/fixtures/notifications/notifications.json';
import readAll from '@/test/fixtures/notifications/read-all.json';
import settings from '@/test/fixtures/notifications/settings.json';
import settingsUpdated from '@/test/fixtures/notifications/settings-updated.json';
import unreadCount from '@/test/fixtures/notifications/unread-count.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { createTestProviders } from '@/test/render';

import { notificationsKeys } from './notificationsKeys';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useNotificationSettings,
  useNotificationsSync,
  useUnreadNotificationCount,
  useUpdateNotificationSettings,
} from './useNotifications';

const NOTIFICATION_ID = notifications.data[0]!.id;

function setup() {
  const fake = createFakeRealtimeClient();
  const realtime = createRealtimeService(() => fake.client);
  const sessionStore = createSessionStore();
  sessionStore.getState().setAuthenticated(buildSessionUser('client', { id: 'u1' }));
  realtime.start();
  const providers = createTestProviders({ realtime, sessionStore });
  return {
    ...providers,
    fake,
    mock: new MockAdapter(providers.api),
    wrapper: providers.TestProviders,
  };
}

describe('hooks des notifications', () => {
  it('hiérarchise les clés sous « notifications »', () => {
    expect(notificationsKeys.list()).toEqual(['notifications', 'list']);
    expect(notificationsKeys.unreadCount()).toEqual(['notifications', 'unread-count']);
    expect(notificationsKeys.settings()).toEqual(['notifications', 'settings']);
  });

  it('lit les notifications, le compteur et les préférences', async () => {
    const { mock, wrapper } = setup();
    mock.onGet('/notifications').reply(200, notifications);
    mock.onGet('/notifications/unread-count').reply(200, unreadCount);
    mock.onGet('/notification-settings').reply(200, settings);

    const hooks = [
      await renderHook(() => useNotifications(), { wrapper }),
      await renderHook(() => useUnreadNotificationCount(), { wrapper }),
      await renderHook(() => useNotificationSettings(), { wrapper }),
    ];

    for (const { result } of hooks) {
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    }
  });

  it('les écritures rechargent les notifications', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost(`/notifications/${NOTIFICATION_ID}/read`).reply(200, notificationRead);
    mock.onPost('/notifications/read-all').reply(200, readAll);
    mock.onPut('/notification-settings').reply(200, settingsUpdated);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const one = await renderHook(() => useMarkNotificationRead(), { wrapper });
    const all = await renderHook(() => useMarkAllNotificationsRead(), { wrapper });
    const preferences = await renderHook(() => useUpdateNotificationSettings(), { wrapper });

    await act(async () => {
      await one.result.current.mutateAsync(NOTIFICATION_ID);
      await all.result.current.mutateAsync();
      await preferences.result.current.mutateAsync({
        in_app: true,
        push: false,
        email: true,
        sms: false,
      });
    });
    await waitFor(() => expect(preferences.result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: notificationsKeys.all });
  });

  it('useNotificationsSync recharge à la réception d’une notification', async () => {
    const { wrapper, queryClient, fake } = setup();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    await renderHook(() => useNotificationsSync(), { wrapper });
    await act(async () => {
      fake.channels.get('notifications.u1')?.emit('NotificationCreated', { id: 'n1' });
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: notificationsKeys.all });
  });
});
