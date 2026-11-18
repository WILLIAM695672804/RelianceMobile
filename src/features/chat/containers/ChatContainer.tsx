import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import { formatDate } from '@/shared/format';
import { QueryGate, useToast } from '@/shared/ui';

import {
  useConversation,
  useConversationSync,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from '../hooks/useChat';
import { otherMembers, sortedMessages } from '../model/conversation';
import type { Conversation, Message } from '../schemas/chatSchemas';
import { ChatView, type ChatItem } from '../ui/ChatViews';

/**
 * Fil affichable : messages du plus ancien au plus récent, précédés d'un séparateur à chaque
 * changement de jour. Les messages vides (pièce jointe seule) sont écartés.
 */
export function toChatItems(
  messages: readonly Message[],
  selfId: string | null,
  labels: { today: string; now?: Date },
): ChatItem[] {
  const now = labels.now ?? new Date();
  const items: ChatItem[] = [];
  let currentDay: string | null = null;
  for (const message of sortedMessages([...messages])) {
    if (!message.body) continue;
    const day = message.created_at ? new Date(message.created_at).toDateString() : null;
    if (day && day !== currentDay) {
      currentDay = day;
      items.push({
        kind: 'day',
        id: `jour-${day}`,
        label: day === now.toDateString() ? labels.today : formatDate(message.created_at!),
      });
    }
    items.push({
      kind: 'message',
      id: message.id,
      mine: Boolean(selfId && message.sender_id === selfId),
      text: message.body,
    });
  }
  return items;
}

/** Interlocuteur affiché dans l'en-tête : autres membres, puis sujet, puis valeur de repli. */
export function chatContact(
  conversation: Conversation,
  selfId: string | null,
  labels: { fallback: string; context: string },
) {
  const names = otherMembers(conversation, selfId)
    .map((member) => member.name)
    .filter((name): name is string => Boolean(name));
  const name = names.length > 0 ? names.join(', ') : (conversation.subject ?? labels.fallback);
  const context =
    conversation.subject && conversation.subject !== name ? conversation.subject : labels.context;
  return { name, online: false, context };
}

export interface ChatContainerProps {
  conversationId: string;
  onBack: () => void;
}

/** Conversation : fil, accusé de lecture à l'ouverture, envoi et synchronisation temps réel. */
export function ChatContainer({ conversationId, onBack }: ChatContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const selfId = useSession((state) => state.user?.id ?? null);
  const conversation = useConversation(conversationId);
  const messages = useMessages(conversationId);
  const send = useSendMessage(conversationId);
  const markRead = useMarkConversationRead(conversationId);
  useConversationSync(conversationId);

  // Une seule lecture par ouverture : les suivantes sont déclenchées par le temps réel.
  const marked = useRef(false);
  useEffect(() => {
    if (marked.current) return;
    marked.current = true;
    markRead.mutate();
  }, [markRead]);

  const onSend = async (text: string) => {
    try {
      await send.mutateAsync(text);
    } catch (error) {
      toast.show({
        kind: 'error',
        title: t('chat:thread.sendFailed'),
        body: describeError(normalizeError(error), t),
      });
    }
  };

  return (
    <QueryGate queries={[conversation, messages]}>
      {() => (
        <ChatView
          contact={chatContact(conversation.data!, selfId, {
            fallback: t('chat:list.fallbackTitle'),
            context: t('chat:thread.title'),
          })}
          items={toChatItems(messages.data ?? [], selfId, { today: t('chat:thread.today') })}
          sending={send.isPending}
          onBack={onBack}
          onSend={(text) => void onSend(text)}
        />
      )}
    </QueryGate>
  );
}
