import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';
import { channels, useChannelEvent } from '@/core/realtime';

import {
  createConversation,
  fetchConversation,
  fetchConversations,
  fetchMessages,
  fetchUnreadMessageCount,
  markConversationRead,
  sendMessage,
} from '../api/chatApi';
import type { ConversationPayload } from '../schemas/chatSchemas';
import { chatKeys } from './chatKeys';

export function useConversations() {
  const api = useApiClient();
  return useQuery({ queryKey: chatKeys.conversations(), queryFn: () => fetchConversations(api) });
}

export function useConversation(conversationId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: chatKeys.conversation(conversationId),
    queryFn: () => fetchConversation(api, conversationId),
  });
}

export function useMessages(conversationId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: () => fetchMessages(api, conversationId),
  });
}

export function useUnreadMessageCount() {
  const api = useApiClient();
  return useQuery({
    queryKey: chatKeys.unreadCount(),
    queryFn: () => fetchUnreadMessageCount(api),
  });
}

/** Toute écriture recharge conversations, fils et compteur. */
function useChatInvalidation() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: chatKeys.all });
}

export function useCreateConversation() {
  const api = useApiClient();
  const invalidate = useChatInvalidation();
  return useMutation({
    mutationFn: (payload: ConversationPayload) => createConversation(api, payload),
    onSuccess: invalidate,
  });
}

export function useSendMessage(conversationId: string) {
  const api = useApiClient();
  const invalidate = useChatInvalidation();
  return useMutation({
    mutationFn: (body: string) => sendMessage(api, conversationId, body),
    onSuccess: invalidate,
  });
}

export function useMarkConversationRead(conversationId: string) {
  const api = useApiClient();
  const invalidate = useChatInvalidation();
  return useMutation({
    mutationFn: () => markConversationRead(api, conversationId),
    onSuccess: invalidate,
  });
}

/** Canal `conversation.{id}` : message reçu ou accusé de lecture. */
export function useConversationSync(conversationId: string | null) {
  const queryClient = useQueryClient();
  const channel = conversationId ? channels.conversation(conversationId) : null;
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: chatKeys.all });
  };

  useChannelEvent(channel, 'MessageSent', invalidate);
  useChannelEvent(channel, 'MessageRead', invalidate);
}
