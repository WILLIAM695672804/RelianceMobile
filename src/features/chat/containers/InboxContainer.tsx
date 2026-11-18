import { useTranslation } from 'react-i18next';

import { useSession } from '@/core/session';
import { formatClockTime, formatDate } from '@/shared/format';
import { QueryGate } from '@/shared/ui';

import { useConversations } from '../hooks/useChat';
import type { Conversation } from '../schemas/chatSchemas';
import { InboxView, type ConversationSummary } from '../ui/ChatViews';
import { chatContact } from './ChatContainer';

/** Heure du jour même, date sinon. */
export function shortWhen(iso: string | null | undefined, now = new Date()): string {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toDateString() === now.toDateString() ? formatClockTime(iso) : formatDate(iso);
}

export function toConversationSummary(
  conversation: Conversation,
  selfId: string | null,
  fallbackTitle: string,
): ConversationSummary {
  return {
    id: conversation.id,
    name: chatContact(conversation, selfId, { fallback: fallbackTitle, context: '' }).name,
    last: conversation.last_message?.body ?? '',
    time: shortWhen(conversation.last_message?.created_at ?? conversation.created_at),
    unread: conversation.unread_count ?? 0,
    online: false,
    archived: false,
  };
}

export interface InboxContainerProps {
  onOpen: (conversationId: string) => void;
  onNew?: () => void;
  onBack?: () => void;
}

/** Onglet « Messages » : conversations de l'utilisateur. */
export function InboxContainer({ onOpen, onNew, onBack }: InboxContainerProps) {
  const { t } = useTranslation();
  const selfId = useSession((state) => state.user?.id ?? null);
  const conversations = useConversations();

  return (
    <QueryGate queries={[conversations]} withTabBar={!onBack}>
      {() => (
        <InboxView
          conversations={(conversations.data ?? []).map((conversation) =>
            toConversationSummary(conversation, selfId, t('chat:list.fallbackTitle')),
          )}
          onOpen={(conversation) => onOpen(conversation.id)}
          onNew={onNew}
          onBack={onBack}
        />
      )}
    </QueryGate>
  );
}
