import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import conversationCreated from '@/test/fixtures/chat/conversation-created.json';
import { renderWithProviders } from '@/test/render';

import { chatTranslations } from '../i18n';
import { StartChatScreen } from './StartChatScreen';

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('StartChatScreen', () => {
  it('crée ou retrouve la conversation puis la transmet', async () => {
    const { api, mock } = setupApi();
    mock.onPost('/conversations').reply(201, conversationCreated);
    const onOpened = jest.fn();
    await renderWithProviders(
      <StartChatScreen memberId="u2" subject="Intervention" onOpened={onOpened} />,
      { api, translations: [chatTranslations] },
    );

    await waitFor(() => expect(onOpened).toHaveBeenCalledWith(conversationCreated.data.id));
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      members: ['u2'],
      subject: 'Intervention',
    });
  });

  it('signale un échec et permet de réessayer', async () => {
    const { api, mock } = setupApi();
    mock.onPost('/conversations').reply(500, {});
    await renderWithProviders(<StartChatScreen memberId="u2" onOpened={jest.fn()} />, {
      api,
      translations: [chatTranslations],
    });
    const user = userEvent.setup();

    expect(await screen.findByText('Impossible d’ouvrir la conversation.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Réessayer' }));

    await waitFor(() => expect(mock.history.post.length).toBeGreaterThan(1));
  });
});
