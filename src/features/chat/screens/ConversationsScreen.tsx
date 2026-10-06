import { useTranslation } from 'react-i18next';

import { useSession } from '@/core/session';
import { Badge, Button, Card, Screen, StateView, Text } from '@/shared/components';

import { useConversations, useUnreadMessageCount } from '../hooks/useChat';
import { conversationTitle } from '../model/conversation';
import type { Conversation } from '../schemas/chatSchemas';

export interface ConversationsScreenProps {
  /** Ouverture d'un fil de discussion. */
  onOpen: (conversationId: string) => void;
}

/** E24 — Liste des conversations. */
export function ConversationsScreen({ onOpen }: ConversationsScreenProps) {
  const { t } = useTranslation();
  const selfId = useSession((state) => state.user?.id ?? null);
  const conversations = useConversations();
  const unread = useUnreadMessageCount();

  const refresh = () => {
    void conversations.refetch();
    void unread.refetch();
  };

  const renderConversation = (conversation: Conversation) => {
    const title = conversationTitle(conversation, selfId, t('chat:list.fallbackTitle'));
    const last = conversation.last_message;
    return (
      <Card key={conversation.id}>
        <Text variant="subtitle">{title}</Text>
        {conversation.unread_count ? (
          <Badge
            label={t('chat:list.unread', { count: conversation.unread_count })}
            tone="warning"
          />
        ) : null}
        {last?.body ? (
          <Text tone="muted">
            {t('chat:list.lastMessage', {
              sender: last.sender?.name ?? t('chat:thread.unknownSender'),
              body: last.body,
            })}
          </Text>
        ) : (
          <Text tone="muted">{t('chat:list.noMessage')}</Text>
        )}
        <Button
          label={t('chat:list.open')}
          accessibilityLabel={t('chat:list.openNamed', { title })}
          onPress={() => onOpen(conversation.id)}
          variant="secondary"
        />
      </Card>
    );
  };

  const renderList = () => {
    if (conversations.isPending) return <StateView status="loading" />;
    if (conversations.isError) {
      return (
        <StateView
          status="error"
          error={conversations.error}
          onRetry={() => void conversations.refetch()}
        />
      );
    }
    if (conversations.data.length === 0) {
      return <StateView status="empty" message={t('chat:list.empty')} />;
    }
    return conversations.data.map(renderConversation);
  };

  return (
    <Screen onRefresh={refresh} refreshing={conversations.isRefetching}>
      <Text variant="title" accessibilityRole="header">
        {t('chat:list.title')}
      </Text>
      {unread.isSuccess && unread.data > 0 ? (
        <Text tone="primary">{t('chat:list.totalUnread', { count: unread.data })}</Text>
      ) : null}
      {renderList()}
    </Screen>
  );
}
