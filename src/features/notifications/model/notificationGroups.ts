import type { AppNotification } from '../schemas/notificationSchemas';

/** Rubriques du centre de notifications (onglets de la maquette). */
export type NotificationCategory = 'mission' | 'message' | 'finance' | 'account';

const MISSION_TYPES = new Set([
  'proposal',
  'proposal_accepted',
  'proposal_refused',
  'proposal_expired',
  'quote',
  'quote_received',
  'quote_accepted',
  'job_status',
  'diagnostic_fee',
  'sla_penalty',
]);

const FINANCE_TYPES = new Set([
  'debit',
  'credit',
  'withdrawal',
  'wallet_recharge',
  'hold_released',
  'hold_captured',
  'credit_purchase',
]);

/** Rubrique d'une notification, déduite du `payload.type` posé par le serveur. */
export function categoryOf(notification: AppNotification): NotificationCategory {
  const type = notification.payload?.type;
  if (typeof type !== 'string') return 'account';
  if (MISSION_TYPES.has(type)) return 'mission';
  if (FINANCE_TYPES.has(type)) return 'finance';
  if (type.includes('message') || type.includes('chat')) return 'message';
  return 'account';
}

export type NotificationPeriod = 'today' | 'week' | 'older';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Période d'affichage : aujourd'hui, les sept derniers jours, ou plus ancien. */
export function periodOf(createdAt: string | null | undefined, now: Date): NotificationPeriod {
  if (!createdAt) return 'older';
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'older';
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (date.getTime() >= startOfToday) return 'today';
  if (date.getTime() >= startOfToday - 6 * DAY_MS) return 'week';
  return 'older';
}

export interface NotificationGroup {
  period: NotificationPeriod;
  items: AppNotification[];
}

/** Regroupe par période, dans l'ordre reçu, en omettant les périodes vides. */
export function groupByPeriod(
  notifications: readonly AppNotification[],
  now: Date,
): NotificationGroup[] {
  const order: NotificationPeriod[] = ['today', 'week', 'older'];
  return order
    .map((period) => ({
      period,
      items: notifications.filter((item) => periodOf(item.created_at, now) === period),
    }))
    .filter((group) => group.items.length > 0);
}

export type ElapsedUnit = 'now' | 'minute' | 'hour' | 'day' | 'week';

export interface Elapsed {
  unit: ElapsedUnit;
  count: number;
}

/** Délai écoulé, à traduire au format compact de la maquette (« 2 min », « 1 h », « 3 j »). */
export function elapsedOf(createdAt: string | null | undefined, now: Date): Elapsed | null {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  const minutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60000));
  if (minutes < 1) return { unit: 'now', count: 0 };
  if (minutes < 60) return { unit: 'minute', count: minutes };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { unit: 'hour', count: hours };
  const days = Math.floor(hours / 24);
  if (days < 7) return { unit: 'day', count: days };
  return { unit: 'week', count: Math.floor(days / 7) };
}
