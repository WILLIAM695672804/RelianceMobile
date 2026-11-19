import type { ConversationMember } from '../schemas/chatSchemas';

/** Membres autres que l'utilisateur courant. */
export function otherMembers(
  conversation: { members: ConversationMember[] },
  selfId: string | null,
): ConversationMember[] {
  if (!selfId) return conversation.members;
  return conversation.members.filter((member) => member.user_id !== selfId);
}

/** Intitulé : le sujet s'il existe, sinon les autres membres, sinon la valeur de repli. */
export function conversationTitle(
  conversation: { subject?: string | null; members: ConversationMember[] },
  selfId: string | null,
  fallback: string,
): string {
  if (conversation.subject) return conversation.subject;
  const names = otherMembers(conversation, selfId)
    .map((member) => member.name)
    .filter((name): name is string => Boolean(name));
  return names.length > 0 ? names.join(', ') : fallback;
}

/**
 * Messages du plus ancien au plus récent : le serveur les renvoie dans l'ordre inverse.
 * Les messages sans date restent en fin de fil.
 */
export function sortedMessages<T extends { id?: string; created_at?: string | null }>(
  messages: T[],
): T[] {
  return [...messages].sort((left, right) => {
    const leftTime = left.created_at ? Date.parse(left.created_at) : Number.POSITIVE_INFINITY;
    const rightTime = right.created_at ? Date.parse(right.created_at) : Number.POSITIVE_INFINITY;
    // Même seconde : l'identifiant départage, pour un ordre stable d'une lecture à l'autre.
    if (leftTime !== rightTime) return leftTime - rightTime;
    return String(left.id ?? '').localeCompare(String(right.id ?? ''));
  });
}
