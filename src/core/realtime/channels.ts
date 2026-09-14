/**
 * Registre des canaux privés et de leurs événements, conforme à `routes/channels.php`
 * et aux événements `ShouldBroadcast` du backend (aucun ne définit `broadcastAs`).
 */
export const CHANNEL_EVENTS = {
  user: ['KycStatusChanged', 'RoleUpgradeDecision'],
  notifications: ['NotificationCreated'],
  wallet: ['BalanceUpdated', 'HoldCaptured', 'HoldReleased', 'PaymentSettled'],
  quotes: ['QuoteSubmitted', 'InvoiceCreated'],
  proposals: ['ProposalCreated', 'ProposalAccepted', 'ProposalRefused'],
  jobs: ['JobStatusChanged', 'PhasesUpdated'],
  tracking: ['TechnicianPositionUpdated'],
  conversation: ['MessageSent', 'MessageRead'],
} as const;

export type ChannelKind = keyof typeof CHANNEL_EVENTS;
export type ChannelEvent<K extends ChannelKind> = (typeof CHANNEL_EVENTS)[K][number];

/** Référence d'un canal privé : `<kind>.<id>`. */
export interface ChannelRef<K extends ChannelKind = ChannelKind> {
  kind: K;
  id: string;
}

const ref =
  <K extends ChannelKind>(kind: K) =>
  (id: string): ChannelRef<K> => ({ kind, id });

/** Fabriques typées des canaux. */
export const channels = {
  user: ref('user'),
  notifications: ref('notifications'),
  wallet: ref('wallet'),
  quotes: ref('quotes'),
  proposals: ref('proposals'),
  jobs: ref('jobs'),
  tracking: ref('tracking'),
  conversation: ref('conversation'),
};

/** Nom Laravel du canal (Echo ajoute lui-même le préfixe `private-`). */
export function channelName(channel: ChannelRef): string {
  return `${channel.kind}.${channel.id}`;
}

export function isChannelEvent<K extends ChannelKind>(
  kind: K,
  event: string,
): event is ChannelEvent<K> {
  return (CHANNEL_EVENTS[kind] as readonly string[]).includes(event);
}
