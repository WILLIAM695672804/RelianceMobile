import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import {
  conversationPageSchema,
  conversationResponseSchema,
  messagePageSchema,
  messageResponseSchema,
  unreadMessagesSchema,
  type Conversation,
  type ConversationPayload,
  type Message,
} from '../schemas/chatSchemas';

const segment = encodeURIComponent;
const conversation = (data: unknown): Conversation =>
  parseResponse(conversationResponseSchema, data).data;

/** `GET /conversations` : première page, la plus récemment active d'abord. */
export async function fetchConversations(client: AxiosInstance): Promise<Conversation[]> {
  const { data } = await client.get('/conversations');
  return parseResponse(conversationPageSchema, data).data;
}

/** `POST /conversations` : crée la conversation ou retrouve la conversation privée existante. */
export async function createConversation(
  client: AxiosInstance,
  payload: ConversationPayload,
): Promise<Conversation> {
  const body: Record<string, unknown> = { members: payload.members };
  if (payload.subject) body.subject = payload.subject;
  if (payload.initialMessage) body.initial_message = payload.initialMessage;
  const { data } = await client.post('/conversations', body);
  return conversation(data);
}

/** `GET /conversations/{id}`. */
export async function fetchConversation(
  client: AxiosInstance,
  conversationId: string,
): Promise<Conversation> {
  const { data } = await client.get(`/conversations/${segment(conversationId)}`);
  return conversation(data);
}

/** `GET /conversations/unread-count`. */
export async function fetchUnreadMessageCount(client: AxiosInstance): Promise<number> {
  const { data } = await client.get('/conversations/unread-count');
  return parseResponse(unreadMessagesSchema, data).unread_count;
}

/** `GET /conversations/{id}/messages` : page la plus récente (ordre décroissant). */
export async function fetchMessages(
  client: AxiosInstance,
  conversationId: string,
): Promise<Message[]> {
  const { data } = await client.get(`/conversations/${segment(conversationId)}/messages`);
  return parseResponse(messagePageSchema, data).data;
}

/** `POST /conversations/{id}/messages` : diffuse `MessageSent` aux autres membres. */
export async function sendMessage(
  client: AxiosInstance,
  conversationId: string,
  body: string,
): Promise<Message> {
  const { data } = await client.post(`/conversations/${segment(conversationId)}/messages`, {
    body,
  });
  return parseResponse(messageResponseSchema, data).data;
}

/** `POST /conversations/{id}/messages/read` : remet le compteur du membre à zéro. */
export async function markConversationRead(
  client: AxiosInstance,
  conversationId: string,
): Promise<void> {
  await client.post(`/conversations/${segment(conversationId)}/messages/read`);
}
