import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import settings from '@/test/fixtures/notifications/settings.json';
import settingsUpdated from '@/test/fixtures/notifications/settings-updated.json';
import { renderWithProviders } from '@/test/render';

import { notificationsTranslations } from '../i18n';
import { NotificationSettingsContainer } from './NotificationSettingsContainer';

describe('NotificationSettingsContainer', () => {
  it('enregistre la bascule d’un canal', async () => {
    const api = axios.create({ baseURL: 'http://api.test/api/v1' });
    const mock = new MockAdapter(api);
    mock.onGet('/notification-settings').reply(200, settings);
    mock.onPut('/notification-settings').reply(200, settingsUpdated);
    await renderWithProviders(<NotificationSettingsContainer onBack={jest.fn()} />, {
      api,
      translations: [notificationsTranslations],
    });
    const user = userEvent.setup();

    await user.press(await screen.findByRole('switch', { name: 'Courriel' }));
    await user.press(screen.getByRole('button', { name: 'Enregistrer les préférences' }));

    await waitFor(() => expect(mock.history.put).toHaveLength(1));
    expect(await screen.findByText('Préférences enregistrées.')).toBeOnTheScreen();
  });
});
