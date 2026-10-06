import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import notificationRead from '@/test/fixtures/notifications/notification-read.json';
import notifications from '@/test/fixtures/notifications/notifications.json';
import readAll from '@/test/fixtures/notifications/read-all.json';
import settings from '@/test/fixtures/notifications/settings.json';
import settingsUpdated from '@/test/fixtures/notifications/settings-updated.json';
import unreadCount from '@/test/fixtures/notifications/unread-count.json';
import { renderWithProviders } from '@/test/render';

import { notificationsTranslations } from '../i18n';
import { NotificationSettingsScreen } from './NotificationSettingsScreen';
import { NotificationsScreen } from './NotificationsScreen';

const FIRST = notifications.data[0]!;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('NotificationsScreen (E23)', () => {
  it('liste les notifications et le nombre de non-lues', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/notifications').reply(200, notifications);
    mock.onGet('/notifications/unread-count').reply(200, unreadCount);
    await renderWithProviders(<NotificationsScreen onOpenSettings={jest.fn()} />, {
      api,
      translations: [notificationsTranslations],
    });

    expect((await screen.findAllByText(FIRST.title)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(FIRST.body).length).toBeGreaterThan(0);
    expect(await screen.findByText(`${unreadCount.count} non lue(s)`)).toBeOnTheScreen();
  });

  it('marque une notification puis toutes comme lues', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/notifications').reply(200, notifications);
    mock.onGet('/notifications/unread-count').reply(200, unreadCount);
    mock.onPost(`/notifications/${FIRST.id}/read`).reply(200, notificationRead);
    mock.onPost('/notifications/read-all').reply(200, readAll);
    await renderWithProviders(<NotificationsScreen onOpenSettings={jest.fn()} />, {
      api,
      translations: [notificationsTranslations],
    });
    const user = userEvent.setup();

    const [markButton] = await screen.findAllByRole('button', {
      name: `Marquer comme lue : ${FIRST.title}`,
    });
    await user.press(markButton!);
    expect(await screen.findByText('Notification marquée comme lue.')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Tout marquer comme lu' }));
    expect(
      await screen.findByText('Toutes les notifications sont marquées comme lues.'),
    ).toBeOnTheScreen();
    await waitFor(() => expect(mock.history.post).toHaveLength(2));
  });

  it('annonce une liste vide et ouvre les préférences', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/notifications').reply(200, { data: [] });
    mock.onGet('/notifications/unread-count').reply(200, { count: 0 });
    const onOpenSettings = jest.fn();
    await renderWithProviders(<NotificationsScreen onOpenSettings={onOpenSettings} />, {
      api,
      translations: [notificationsTranslations],
    });
    const user = userEvent.setup();

    expect(await screen.findByText('Aucune notification.')).toBeOnTheScreen();
    expect(await screen.findByText('Tout est lu.')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Préférences de notification' }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});

describe('NotificationSettingsScreen', () => {
  it('présente les canaux et enregistre les préférences', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/notification-settings').reply(200, settings);
    mock.onPut('/notification-settings').reply(200, settingsUpdated);
    await renderWithProviders(<NotificationSettingsScreen />, {
      api,
      translations: [notificationsTranslations],
    });
    const user = userEvent.setup();

    expect(await screen.findByText('Dans l’application')).toBeOnTheScreen();
    expect(
      screen.getByText('Non encore disponible : le serveur n’envoie pas de notification poussée.'),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Changer : Courriel' }));
    await user.press(screen.getByRole('button', { name: 'Enregistrer les préférences' }));

    expect(await screen.findByText('Préférences enregistrées.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.put[0]?.data as string)).toMatchObject({ email: false });
  });

  it('propose de réessayer après un échec de lecture', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/notification-settings').reply(500, {});
    await renderWithProviders(<NotificationSettingsScreen />, {
      api,
      translations: [notificationsTranslations],
    });
    const user = userEvent.setup();

    expect(
      await screen.findByText('Une erreur est survenue. Veuillez réessayer ultérieurement.'),
    ).toBeOnTheScreen();
    mock.onGet('/notification-settings').reply(200, settings);
    await user.press(screen.getByRole('button', { name: 'Réessayer' }));

    expect(await screen.findByText('Dans l’application')).toBeOnTheScreen();
  });
});
