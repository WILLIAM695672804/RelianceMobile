import { router } from 'expo-router';

import { ConversationsScreen } from '@/features/chat';

/** Liste des conversations reliée au fil de discussion. */
export function ConversationsRoute() {
  return (
    <ConversationsScreen
      onOpen={(id) => router.push({ pathname: '/conversations/[id]', params: { id } })}
    />
  );
}
