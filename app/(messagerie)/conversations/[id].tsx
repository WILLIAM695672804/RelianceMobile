import { useLocalSearchParams } from 'expo-router';

import { ChatScreen } from '@/features/chat';

export default function ConversationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ChatScreen conversationId={id} />;
}
