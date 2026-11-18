import { router } from 'expo-router';

import { InboxContainer } from '@/features/chat';

/** Conversations ouvertes hors des onglets (profil, notifications). */
export function ConversationsRoute() {
  return (
    <InboxContainer
      onOpen={(id) => router.push({ pathname: '/conversations/[id]', params: { id } })}
      onNew={() => router.push('/conversations/new')}
      onBack={() => router.back()}
    />
  );
}
