import conversationCreated from '@/test/fixtures/chat/conversation-created.json';
import conversation from '@/test/fixtures/chat/conversation.json';
import conversations from '@/test/fixtures/chat/conversations.json';
import messageCreated from '@/test/fixtures/chat/message-created.json';
import messages from '@/test/fixtures/chat/messages.json';
import unreadCount from '@/test/fixtures/chat/unread-count.json';

import {
  conversationPageSchema,
  conversationResponseSchema,
  messageFormSchema,
  messagePageSchema,
  messageResponseSchema,
  unreadMessagesSchema,
} from './chatSchemas';

describe('chatSchemas', () => {
  it('lit la liste des conversations et leurs membres', () => {
    const page = conversationPageSchema.parse(conversations);
    const first = page.data[0]!;

    expect(page.data).toHaveLength(conversations.data.length);
    expect(first.subject).toBe(conversations.data[0]!.subject);
    expect(first.members).toHaveLength(2);
    expect(first.last_message?.body).toBe(conversations.data[0]!.last_message.body);
  });

  it('lit une conversation, sa création et un message envoyé', () => {
    expect(conversationResponseSchema.parse(conversation).data.id).toBe(conversation.data.id);
    expect(conversationResponseSchema.parse(conversationCreated).data.members).toHaveLength(2);
    expect(messageResponseSchema.parse(messageCreated).data.body).toBe(messageCreated.data.body);
  });

  it('lit la page de messages et le compteur de non-lus', () => {
    const page = messagePageSchema.parse(messages);

    expect(page.data).toHaveLength(messages.data.length);
    expect(page.data[0]?.sender?.name).toBe(messages.data[0]!.sender.name);
    expect(unreadMessagesSchema.parse(unreadCount).unread_count).toBe(unreadCount.unread_count);
  });

  it('valide le corps d’un message', () => {
    expect(messageFormSchema.safeParse({ body: 'Bonjour' }).success).toBe(true);
    expect(messageFormSchema.safeParse({ body: '  ' }).error?.issues[0]?.message).toBe(
      'chat:thread.errors.bodyRequired',
    );
    expect(messageFormSchema.safeParse({ body: 'x'.repeat(5001) }).error?.issues[0]?.message).toBe(
      'chat:thread.errors.bodyTooLong',
    );
  });
});
