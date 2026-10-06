import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createSessionStore } from '@/core/session';
import conversationCreated from '@/test/fixtures/chat/conversation-created.json';
import conversation from '@/test/fixtures/chat/conversation.json';
import messageCreated from '@/test/fixtures/chat/message-created.json';
import messages from '@/test/fixtures/chat/messages.json';
import messagesRead from '@/test/fixtures/chat/messages-read.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { chatTranslations } from '../i18n';
import { ChatScreen } from './ChatScreen';
import { StartChatScreen } from './StartChatScreen';

const CONVERSATION_ID = conversation.data.id;
const SENDER_ID = messages.data[0]!.sender.id;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

function storeWith(id: string) {
  const store = createSessionStore();
  store.getState().setAuthenticated(buildSessionUser('client', { id }));
  return store;
}

describe('ChatScreen (E24)', () => {
  it('présente le fil, marque la lecture et envoie un message', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/conversations/${CONVERSATION_ID}`).reply(200, conversation);
    mock.onGet(`/conversations/${CONVERSATION_ID}/messages`).reply(200, messages);
    mock.onPost(`/conversations/${CONVERSATION_ID}/messages/read`).reply(200, messagesRead);
    mock.onPost(`/conversations/${CONVERSATION_ID}/messages`).reply(201, messageCreated);
    await renderWithProviders(<ChatScreen conversationId={CONVERSATION_ID} />, {
      api,
      sessionStore: storeWith(SENDER_ID),
      translations: [chatTranslations],
    });
    const user = userEvent.setup();

    expect((await screen.findAllByText(messages.data[0]!.body)).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Moi').length).toBeGreaterThan(0);
    await waitFor(() =>
      expect(mock.history.post.some((request) => request.url?.endsWith('/messages/read'))).toBe(
        true,
      ),
    );

    await fireEvent.changeText(screen.getByLabelText('Votre message'), 'Merci beaucoup.');
    await user.press(screen.getByRole('button', { name: 'Envoyer' }));

    await waitFor(() =>
      expect(
        mock.history.post.some(
          (request) =>
            request.url === `/conversations/${CONVERSATION_ID}/messages` &&
            JSON.parse(request.data as string).body === 'Merci beaucoup.',
        ),
      ).toBe(true),
    );
  });

  it('refuse un message vide', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/conversations/${CONVERSATION_ID}`).reply(200, conversation);
    mock.onGet(`/conversations/${CONVERSATION_ID}/messages`).reply(200, { data: [] });
    mock.onPost(`/conversations/${CONVERSATION_ID}/messages/read`).reply(200, messagesRead);
    await renderWithProviders(<ChatScreen conversationId={CONVERSATION_ID} />, {
      api,
      sessionStore: storeWith(SENDER_ID),
      translations: [chatTranslations],
    });
    const user = userEvent.setup();

    expect(await screen.findByText('Démarrez la conversation.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Envoyer' }));

    expect(await screen.findByText('Saisissez un message.')).toBeOnTheScreen();
  });

  it('propose de réessayer après un échec de lecture', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/conversations/${CONVERSATION_ID}`).reply(500, {});
    mock.onGet(`/conversations/${CONVERSATION_ID}/messages`).reply(500, {});
    await renderWithProviders(<ChatScreen conversationId={CONVERSATION_ID} />, {
      api,
      sessionStore: storeWith(SENDER_ID),
      translations: [chatTranslations],
    });

    expect(
      await screen.findByText('Une erreur est survenue. Veuillez réessayer ultérieurement.'),
    ).toBeOnTheScreen();
  });
});

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
