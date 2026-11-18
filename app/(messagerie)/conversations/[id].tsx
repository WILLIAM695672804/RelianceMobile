import { router, useLocalSearchParams } from 'expo-router';

import { ChatContainer } from '@/features/chat';

export default function ConversationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ChatContainer conversationId={id} onBack={() => router.back()} />;
}
