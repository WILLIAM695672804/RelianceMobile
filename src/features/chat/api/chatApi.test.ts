import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import conversationCreated from '@/test/fixtures/chat/conversation-created.json';
import conversation from '@/test/fixtures/chat/conversation.json';
import conversations from '@/test/fixtures/chat/conversations.json';
import messageCreated from '@/test/fixtures/chat/message-created.json';
import messages from '@/test/fixtures/chat/messages.json';
import messagesRead from '@/test/fixtures/chat/messages-read.json';
import unreadCount from '@/test/fixtures/chat/unread-count.json';

import {
  createConversation,
  fetchConversation,
  fetchConversations,
  fetchMessages,
  fetchUnreadMessageCount,
  markConversationRead,
  sendMessage,
} from './chatApi';

const CONVERSATION_ID = conversation.data.id;

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('chatApi', () => {
  it('lit les conversations, une conversation et le compteur', async () => {
    const { client, mock } = setup();
    mock.onGet('/conversations').reply(200, conversations);
    mock.onGet(`/conversations/${CONVERSATION_ID}`).reply(200, conversation);
    mock.onGet('/conversations/unread-count').reply(200, unreadCount);

    await expect(fetchConversations(client)).resolves.toHaveLength(conversations.data.length);
    await expect(fetchConversation(client, CONVERSATION_ID)).resolves.toMatchObject({
      id: CONVERSATION_ID,
    });
    await expect(fetchUnreadMessageCount(client)).resolves.toBe(unreadCount.unread_count);
  });

  it('crée une conversation au format du serveur', async () => {
    const { client, mock } = setup();
    mock.onPost('/conversations').reply(201, conversationCreated);

    await expect(
      createConversation(client, {
        members: ['u2'],
        subject: 'Intervention électrique',
        initialMessage: 'Bonjour',
      }),
    ).resolves.toMatchObject({ id: conversationCreated.data.id });

    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      members: ['u2'],
      subject: 'Intervention électrique',
      initial_message: 'Bonjour',
    });
  });

  it('omet le sujet et le message initial absents', async () => {
    const { client, mock } = setup();
    mock.onPost('/conversations').reply(201, conversationCreated);

    await createConversation(client, { members: ['u2'] });

    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({ members: ['u2'] });
  });

  it('lit les messages, en envoie un et marque le fil comme lu', async () => {
    const { client, mock } = setup();
    mock.onGet(`/conversations/${CONVERSATION_ID}/messages`).reply(200, messages);
    mock.onPost(`/conversations/${CONVERSATION_ID}/messages`).reply(201, messageCreated);
    mock.onPost(`/conversations/${CONVERSATION_ID}/messages/read`).reply(200, messagesRead);

    await expect(fetchMessages(client, CONVERSATION_ID)).resolves.toHaveLength(
      messages.data.length,
    );
    await expect(sendMessage(client, CONVERSATION_ID, 'Bonjour')).resolves.toMatchObject({
      id: messageCreated.data.id,
    });
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({ body: 'Bonjour' });
    await expect(markConversationRead(client, CONVERSATION_ID)).resolves.toBeUndefined();
  });
});
