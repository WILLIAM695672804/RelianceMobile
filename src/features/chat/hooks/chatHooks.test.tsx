import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import { createRealtimeService } from '@/core/realtime';
import { createSessionStore } from '@/core/session';
import { createFakeRealtimeClient } from '@/test/fakeRealtime';
import conversationCreated from '@/test/fixtures/chat/conversation-created.json';
import conversation from '@/test/fixtures/chat/conversation.json';
import conversations from '@/test/fixtures/chat/conversations.json';
import messageCreated from '@/test/fixtures/chat/message-created.json';
import messages from '@/test/fixtures/chat/messages.json';
import messagesRead from '@/test/fixtures/chat/messages-read.json';
import unreadCount from '@/test/fixtures/chat/unread-count.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { createTestProviders } from '@/test/render';

import { chatKeys } from './chatKeys';
import {
  useConversation,
  useConversations,
  useConversationSync,
  useCreateConversation,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
  useUnreadMessageCount,
} from './useChat';

const CONVERSATION_ID = conversation.data.id;

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

describe('hooks de la messagerie', () => {
  it('hiérarchise les clés sous « chat »', () => {
    expect(chatKeys.conversations()).toEqual(['chat', 'conversations']);
    expect(chatKeys.conversation('c1')).toEqual(['chat', 'conversations', 'c1']);
    expect(chatKeys.messages('c1')).toEqual(['chat', 'messages', 'c1']);
    expect(chatKeys.unreadCount()).toEqual(['chat', 'unread-count']);
  });

  it('lit les conversations, une conversation, ses messages et le compteur', async () => {
    const { mock, wrapper } = setup();
    mock.onGet('/conversations').reply(200, conversations);
    mock.onGet(`/conversations/${CONVERSATION_ID}`).reply(200, conversation);
    mock.onGet(`/conversations/${CONVERSATION_ID}/messages`).reply(200, messages);
    mock.onGet('/conversations/unread-count').reply(200, unreadCount);

    const hooks = [
      await renderHook(() => useConversations(), { wrapper }),
      await renderHook(() => useConversation(CONVERSATION_ID), { wrapper }),
      await renderHook(() => useMessages(CONVERSATION_ID), { wrapper }),
      await renderHook(() => useUnreadMessageCount(), { wrapper }),
    ];

    for (const { result } of hooks) {
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    }
  });

  it('les écritures rechargent la messagerie', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost('/conversations').reply(201, conversationCreated);
    mock.onPost(`/conversations/${CONVERSATION_ID}/messages`).reply(201, messageCreated);
    mock.onPost(`/conversations/${CONVERSATION_ID}/messages/read`).reply(200, messagesRead);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const create = await renderHook(() => useCreateConversation(), { wrapper });
    const send = await renderHook(() => useSendMessage(CONVERSATION_ID), { wrapper });
    const read = await renderHook(() => useMarkConversationRead(CONVERSATION_ID), { wrapper });

    await act(async () => {
      await create.result.current.mutateAsync({ members: ['u2'] });
      await send.result.current.mutateAsync('Bonjour');
      await read.result.current.mutateAsync();
    });
    await waitFor(() => expect(read.result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: chatKeys.all });
  });

  it('useConversationSync recharge le fil aux événements du canal', async () => {
    const { wrapper, queryClient, fake } = setup();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    await renderHook(() => useConversationSync('c1'), { wrapper });

    await act(async () => {
      fake.channels.get('conversation.c1')?.emit('MessageSent', { id: 'm1' });
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: chatKeys.all });

    invalidate.mockClear();
    await act(async () => {
      fake.channels.get('conversation.c1')?.emit('MessageRead', { id: 'm1' });
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: chatKeys.all });
  });

  it('useConversationSync ne s’abonne à rien sans conversation', async () => {
    const { wrapper, fake } = setup();

    await renderHook(() => useConversationSync(null), { wrapper });

    expect(fake.privateChannel).not.toHaveBeenCalled();
  });
});
