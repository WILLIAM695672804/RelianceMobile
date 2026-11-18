import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createSessionStore } from '@/core/session';
import conversation from '@/test/fixtures/chat/conversation.json';
import messageCreated from '@/test/fixtures/chat/message-created.json';
import messagesRead from '@/test/fixtures/chat/messages-read.json';
import messages from '@/test/fixtures/chat/messages.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { chatTranslations } from '../i18n';
import type { Conversation, Message } from '../schemas/chatSchemas';
import { ChatContainer, chatContact, toChatItems } from './ChatContainer';

const CONVERSATION_ID = conversation.data.id;
const SENDER_ID = messages.data[0]!.sender.id;
const BASE = `/conversations/${CONVERSATION_ID}`;

function message(id: string, createdAt: string | null, overrides: Partial<Message> = {}): Message {
  return { id, sender_id: 'autre', body: `corps ${id}`, created_at: createdAt, ...overrides };
}

describe('toChatItems', () => {
  const now = new Date('2026-11-18T12:00:00Z');

  it('ordonne le fil et insère un séparateur par jour', () => {
    const items = toChatItems(
      [
        message('c', '2026-11-18T09:00:00Z', { sender_id: 'moi' }),
        message('a', '2026-11-16T09:00:00Z'),
        message('b', '2026-11-16T10:00:00Z'),
      ],
      'moi',
      { today: 'Aujourd’hui', now },
    );
    expect(items.map((item) => item.kind)).toEqual(['day', 'message', 'message', 'day', 'message']);
    expect(items[3]).toMatchObject({ kind: 'day', label: 'Aujourd’hui' });
    expect(items[4]).toMatchObject({ id: 'c', mine: true });
    expect(items[1]).toMatchObject({ id: 'a', mine: false });
  });

  it('écarte les messages sans texte', () => {
    expect(toChatItems([message('a', null, { body: null })], 'moi', { today: 'x', now })).toEqual(
      [],
    );
  });
});

describe('chatContact', () => {
  const base: Conversation = {
    id: '1',
    members: [
      { user_id: 'moi', name: 'Moi' },
      { user_id: 'lui', name: 'Paul' },
    ],
  };
  const labels = { fallback: 'Conversation', context: 'Fil' };

  it('nomme les autres membres et garde le sujet en contexte', () => {
    expect(chatContact({ ...base, subject: 'Fuite' }, 'moi', labels)).toEqual({
      name: 'Paul',
      online: false,
      context: 'Fuite',
    });
  });

  it('se replie sur le sujet puis sur la valeur par défaut', () => {
    expect(chatContact({ ...base, members: [], subject: 'Fuite' }, 'moi', labels).name).toBe(
      'Fuite',
    );
    expect(chatContact({ ...base, members: [] }, 'moi', labels)).toMatchObject({
      name: 'Conversation',
      context: 'Fil',
    });
  });
});

describe('ChatContainer', () => {
  function setup() {
    const api = axios.create({ baseURL: 'http://api.test/api/v1' });
    const mock = new MockAdapter(api);
    mock.onGet(BASE).reply(200, conversation);
    mock.onGet(`${BASE}/messages`).reply(200, messages);
    mock.onPost(`${BASE}/messages/read`).reply(200, messagesRead);
    const store = createSessionStore();
    store.getState().setAuthenticated(buildSessionUser('client', { id: SENDER_ID }));
    return { api, mock, store };
  }

  it('affiche le fil, accuse la lecture et envoie un message', async () => {
    const { api, mock, store } = setup();
    mock.onPost(`${BASE}/messages`).reply(201, messageCreated);
    const onBack = jest.fn();
    await renderWithProviders(<ChatContainer conversationId={CONVERSATION_ID} onBack={onBack} />, {
      api,
      sessionStore: store,
      translations: [chatTranslations],
    });
    const user = userEvent.setup();

    expect((await screen.findAllByText(messages.data[0]!.body)).length).toBeGreaterThan(0);
    await waitFor(() =>
      expect(mock.history.post.some((request) => request.url?.endsWith('/messages/read'))).toBe(
        true,
      ),
    );

    await fireEvent.changeText(screen.getByLabelText('Message'), 'Merci beaucoup.');
    await user.press(screen.getByRole('button', { name: 'Envoyer' }));
    await waitFor(() =>
      expect(
        mock.history.post.some(
          (request) =>
            request.url === `${BASE}/messages` &&
            JSON.parse(request.data as string).body === 'Merci beaucoup.',
        ),
      ).toBe(true),
    );
  });

  it('signale un envoi refusé', async () => {
    const { api, mock, store } = setup();
    mock.onPost(`${BASE}/messages`).reply(500);
    await renderWithProviders(
      <ChatContainer conversationId={CONVERSATION_ID} onBack={jest.fn()} />,
      {
        api,
        sessionStore: store,
        translations: [chatTranslations],
      },
    );
    const user = userEvent.setup();

    await screen.findAllByText(messages.data[0]!.body);
    await fireEvent.changeText(screen.getByLabelText('Message'), 'Bonjour');
    await user.press(screen.getByRole('button', { name: 'Envoyer' }));
    expect(await screen.findByText('L’envoi a échoué. Veuillez réessayer.')).toBeTruthy();
  });
});
