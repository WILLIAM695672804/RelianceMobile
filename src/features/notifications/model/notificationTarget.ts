import type { AppNotification } from '../schemas/notificationSchemas';
import { categoryOf } from './notificationGroups';

/** Destination ouverte au toucher d'une notification, indépendante du routeur. */
export type NotificationTarget =
  | { kind: 'conversation'; id: string }
  | { kind: 'request'; id: string }
  | { kind: 'mission' }
  | { kind: 'proposals' }
  | { kind: 'wallet' };

function idOf(notification: AppNotification, key: string): string | null {
  const value = notification.payload?.[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * Destination d'une notification, déduite des identifiants de sa charge utile : conversation
 * d'abord, puis demande (côté client) ou mission (côté technicien), enfin portefeuille.
 */
export function notificationTarget(
  notification: AppNotification,
  role: 'client' | 'technicien' | 'agence' | null,
): NotificationTarget | null {
  const conversationId = idOf(notification, 'conversation_id');
  if (conversationId) return { kind: 'conversation', id: conversationId };

  const category = categoryOf(notification);
  if (category === 'finance') return { kind: 'wallet' };

  // Une proposition reçue par le technicien se traite depuis son accueil.
  if (role === 'technicien' && idOf(notification, 'proposal_id')) return { kind: 'proposals' };

  const requestId = idOf(notification, 'request_id');
  if (role === 'client' && requestId) return { kind: 'request', id: requestId };
  if (role === 'technicien' && (requestId || idOf(notification, 'job_id'))) {
    return { kind: 'mission' };
  }
  return null;
}
