import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Screen, StateView, Text } from '@/shared/components';

import { useCreateConversation } from '../hooks/useChat';

export interface StartChatScreenProps {
  /** Interlocuteur : le serveur retrouve la conversation privée si elle existe. */
  memberId: string;
  subject?: string;
  /** Conversation ouverte : l'appelant redirige vers le fil. */
  onOpened: (conversationId: string) => void;
}

/** Ouverture d'une conversation privée depuis une mission. */
export function StartChatScreen({ memberId, subject, onOpened }: StartChatScreenProps) {
  const { t } = useTranslation();
  const createConversation = useCreateConversation();
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  const start = () => {
    setFailed(false);
    createConversation.mutate(
      { members: [memberId], ...(subject ? { subject } : {}) },
      {
        onSuccess: (conversation) => onOpened(conversation.id),
        onError: () => setFailed(true),
      },
    );
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    start();
    // `start` ne dépend que de propriétés stables pour la durée de l'écran.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen>
      <Text variant="title" accessibilityRole="header">
        {t('chat:start.title')}
      </Text>
      {failed ? (
        <>
          <Text tone="danger">{t('chat:start.failed')}</Text>
          <Button label={t('chat:start.retry')} onPress={start} />
        </>
      ) : (
        <StateView status="loading" />
      )}
    </Screen>
  );
}
