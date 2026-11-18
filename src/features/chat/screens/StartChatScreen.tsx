import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '@/core/theme';
import { EmptyState, Screen, Text, TopBar } from '@/shared/ui';

import { useCreateConversation } from '../hooks/useChat';

export interface StartChatScreenProps {
  /** Interlocuteur : le serveur retrouve la conversation privée si elle existe. */
  memberId: string;
  subject?: string;
  /** Conversation ouverte : l'appelant redirige vers le fil. */
  onOpened: (conversationId: string) => void;
  onBack?: () => void;
}

/** Ouverture d'une conversation privée depuis une mission ou une fiche. */
export function StartChatScreen({ memberId, subject, onOpened, onBack }: StartChatScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
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
    <Screen scroll={false} testID="ouverture-conversation">
      <TopBar title={t('chat:start.title')} onBack={onBack} />
      {failed ? (
        <EmptyState
          icon="chat"
          tone="danger"
          title={t('chat:start.title')}
          message={t('chat:start.failed')}
          actionLabel={t('chat:start.retry')}
          onAction={start}
        />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text variant="label" tone="muted">
            {t('chat:start.title')}
          </Text>
        </View>
      )}
    </Screen>
  );
}
