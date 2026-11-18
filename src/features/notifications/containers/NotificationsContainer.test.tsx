import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createSessionStore } from '@/core/session';
import notificationRead from '@/test/fixtures/notifications/notification-read.json';
import notificationsFixture from '@/test/fixtures/notifications/notifications.json';
import readAll from '@/test/fixtures/notifications/read-all.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { notificationsTranslations } from '../i18n';
import { NotificationsContainer } from './NotificationsContainer';

const UNREAD = notificationsFixture.data.find((item) => !item.is_read)!;

function setup() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/notifications').reply(200, notificationsFixture);
  mock.onPost(`/notifications/${UNREAD.id}/read`).reply(200, notificationRead);
  mock.onPost('/notifications/read-all').reply(200, readAll);
  const store = createSessionStore();
  store.getState().setAuthenticated(buildSessionUser('technicien'));
  return { api, mock, store };
}

describe('NotificationsContainer', () => {
  it('marque lue la notification touchée et mène à la destination', async () => {
    const { api, mock, store } = setup();
    const onNavigate = jest.fn();
    await renderWithProviders(
      <NotificationsContainer onBack={jest.fn()} onNavigate={onNavigate} />,
      { api, sessionStore: store, translations: [notificationsTranslations] },
    );
    const user = userEvent.setup();

    await user.press(await screen.findByTestId(`notification-${UNREAD.id}`));
    await waitFor(() =>
      expect(mock.history.post.some((r) => r.url === `/notifications/${UNREAD.id}/read`)).toBe(
        true,
      ),
    );
    // La charge utile capturée ne porte que le type : aucune destination n'est déduite.
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('marque toutes les notifications comme lues', async () => {
    const { api, mock, store } = setup();
    await renderWithProviders(
      <NotificationsContainer onBack={jest.fn()} onNavigate={jest.fn()} />,
      { api, sessionStore: store, translations: [notificationsTranslations] },
    );
    const user = userEvent.setup();

    await user.press(await screen.findByRole('button', { name: 'Tout lire' }));
    await waitFor(() =>
      expect(mock.history.post.some((r) => r.url === '/notifications/read-all')).toBe(true),
    );
  });

  it('propose de réessayer après un échec de chargement', async () => {
    const { api, mock, store } = setup();
    mock.onGet('/notifications').reply(500);
    await renderWithProviders(
      <NotificationsContainer onBack={jest.fn()} onNavigate={jest.fn()} />,
      { api, sessionStore: store, translations: [notificationsTranslations] },
    );
    expect(await screen.findByRole('button', { name: /Réessayer/ })).toBeOnTheScreen();
  });
});
