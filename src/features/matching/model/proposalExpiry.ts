export type ExpiryState =
  { status: 'expired' } | { status: 'active'; hours: number; minutes: number };

const MINUTE_MS = 60 * 1000;

/** Délai restant avant l'échéance, arrondi à la minute supérieure ; `null` si l'échéance est inconnue. */
export function expiryState(expiresAt: string | null | undefined, now: number): ExpiryState | null {
  if (!expiresAt) return null;
  const remaining = Date.parse(expiresAt) - now;
  if (Number.isNaN(remaining)) return null;
  if (remaining <= 0) return { status: 'expired' };
  const totalMinutes = Math.ceil(remaining / MINUTE_MS);
  return { status: 'active', hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
}

/** Une proposition se décide tant qu'elle est en attente et non expirée. */
export function isActionable(
  proposal: { status: string; expires_at?: string | null },
  now: number,
): boolean {
  return (
    proposal.status === 'pending' && expiryState(proposal.expires_at, now)?.status !== 'expired'
  );
}
