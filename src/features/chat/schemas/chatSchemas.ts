import { z } from 'zod';

const asList = <T>(items: T[] | null | undefined): T[] => items ?? [];

/** Membre d'une conversation (`ConversationResource`). */
export const conversationMemberSchema = z.object({
  user_id: z.string(),
  name: z.string().nullish(),
  avatar_url: z.string().nullish(),
  unread_count: z.number().nullish(),
});
export type ConversationMember = z.infer<typeof conversationMemberSchema>;

/** Message (`MessageResource`) ; les pièces jointes sont hors périmètre. */
export const messageSchema = z.object({
  id: z.string(),
  conversation_id: z.string().nullish(),
  sender_id: z.string().nullish(),
  sender: z
    .object({ id: z.string(), name: z.string(), avatar_url: z.string().nullish() })
    .nullish(),
  body: z.string().nullish(),
  read_at: z.string().nullish(),
  created_at: z.string().nullish(),
});
export type Message = z.infer<typeof messageSchema>;

export const conversationSchema = z.object({
  id: z.string(),
  subject: z.string().nullish(),
  members: z.array(conversationMemberSchema).nullish().transform(asList),
  last_message: messageSchema.nullish(),
  unread_count: z.number().nullish(),
  created_at: z.string().nullish(),
});
export type Conversation = z.infer<typeof conversationSchema>;

export const conversationResponseSchema = z.object({ data: conversationSchema });

export const conversationPageSchema = z.object({
  data: z.array(conversationSchema),
  meta: z.object({ current_page: z.number(), last_page: z.number(), total: z.number() }).nullish(),
});

export const messageResponseSchema = z.object({ data: messageSchema });

export const messagePageSchema = z.object({
  data: z.array(messageSchema),
  meta: z.object({ current_page: z.number(), last_page: z.number(), total: z.number() }).nullish(),
});

export const unreadMessagesSchema = z.object({ unread_count: z.number() });

export const MESSAGE_MAX_LENGTH = 5000;

/** Formulaire d'envoi d'un message. */
export const messageFormSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'chat:thread.errors.bodyRequired')
    .max(MESSAGE_MAX_LENGTH, 'chat:thread.errors.bodyTooLong'),
});
export type MessageFormValues = z.infer<typeof messageFormSchema>;

/** Corps de `POST /conversations`. */
export interface ConversationPayload {
  members: string[];
  subject?: string;
  initialMessage?: string;
}
