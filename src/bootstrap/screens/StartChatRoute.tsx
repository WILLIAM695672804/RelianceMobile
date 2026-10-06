import { router, useLocalSearchParams } from 'expo-router';

import { StartChatScreen } from '@/features/chat';

/** Ouverture d'une conversation privée : l'écran transitoire cède la place au fil. */
export function StartChatRoute() {
  const { member, subject } = useLocalSearchParams<{ member: string; subject?: string }>();
  return (
    <StartChatScreen
      memberId={member}
      subject={subject}
      onOpened={(id) => router.replace({ pathname: '/conversations/[id]', params: { id } })}
    />
  );
}
