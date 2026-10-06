import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useSession } from '@/core/session';
import { Button, Card, FormTextField, Screen, StateView, Text } from '@/shared/components';
import { formatClockTime } from '@/shared/format';

import {
  useConversation,
  useConversationSync,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from '../hooks/useChat';
import { conversationTitle, sortedMessages } from '../model/conversation';
import { messageFormSchema } from '../schemas/chatSchemas';

export interface ChatScreenProps {
  conversationId: string;
}

/** E24 — Fil de discussion : messages, accusé de lecture et envoi. */
export function ChatScreen({ conversationId }: ChatScreenProps) {
  const { t } = useTranslation();
  const selfId = useSession((state) => state.user?.id ?? null);
  const conversation = useConversation(conversationId);
  const messages = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const markRead = useMarkConversationRead(conversationId);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({ resolver: zodResolver(messageFormSchema), defaultValues: { body: '' } });
  useConversationSync(conversationId);

  // Le fil est marqué lu une fois par ouverture : la relecture est déclenchée par le serveur.
  const marked = useRef(false);
  useEffect(() => {
    if (marked.current) return;
    marked.current = true;
    markRead.mutate();
  }, [markRead]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      await sendMessage.mutateAsync(values.body.trim());
      form.reset();
    } catch {
      setError(t('chat:thread.sendFailed'));
    }
  });

  const title = conversation.data
    ? conversationTitle(conversation.data, selfId, t('chat:list.fallbackTitle'))
    : t('chat:thread.title');

  const renderMessages = () => {
    if (messages.isPending) return <StateView status="loading" />;
    if (messages.isError) {
      return (
        <StateView status="error" error={messages.error} onRetry={() => void messages.refetch()} />
      );
    }
    if (messages.data.length === 0) {
      return <StateView status="empty" message={t('chat:thread.empty')} />;
    }
    return sortedMessages(messages.data).map((message) => (
      <Card key={message.id}>
        <View style={styles.header}>
          <Text variant="caption" tone="primary">
            {message.sender_id && message.sender_id === selfId
              ? t('chat:thread.me')
              : (message.sender?.name ?? t('chat:thread.unknownSender'))}
          </Text>
          {message.created_at ? (
            <Text variant="caption" tone="muted">
              {t('chat:thread.sentAt', { time: formatClockTime(message.created_at) })}
            </Text>
          ) : null}
        </View>
        {message.body ? <Text>{message.body}</Text> : null}
      </Card>
    ));
  };

  return (
    <Screen scroll onRefresh={() => void messages.refetch()} refreshing={messages.isRefetching}>
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      {renderMessages()}
      {error ? <Text tone="danger">{error}</Text> : null}
      <FormTextField control={form.control} name="body" label={t('chat:thread.body')} multiline />
      <Button
        label={t('chat:thread.send')}
        onPress={() => void onSubmit()}
        loading={sendMessage.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
});
