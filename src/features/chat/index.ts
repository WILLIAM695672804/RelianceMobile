/**
 * Feature `chat` — messagerie entre client et technicien (E24).
 * @packageDocumentation
 */

export { chatKeys } from './hooks/chatKeys';
export {
  useConversation,
  useConversations,
  useConversationSync,
  useCreateConversation,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
  useUnreadMessageCount,
} from './hooks/useChat';
export { chatTranslations } from './i18n';
export { conversationTitle, otherMembers, sortedMessages } from './model/conversation';
export { StartChatScreen, type StartChatScreenProps } from './screens/StartChatScreen';
export type { Conversation, ConversationMember, Message } from './schemas/chatSchemas';
export {
  ChatView,
  InboxView,
  type ChatItem,
  type ChatViewProps,
  type ConversationSummary,
  type InboxViewProps,
} from './ui/ChatViews';
export { InboxContainer, type InboxContainerProps } from './containers/InboxContainer';
export {
  ChatContainer,
  chatContact,
  toChatItems,
  type ChatContainerProps,
} from './containers/ChatContainer';
