import { useEffect } from 'react';

import { bindAppStateLifecycle, channels, useChannelEvent, useRealtime } from '@/core/realtime';
import { useSession, useSessionActions } from '@/core/session';

/** Abonnements temps réel transverses et cycle de vie de la connexion. */
export function RealtimeBridge() {
  const realtime = useRealtime();
  const { restore } = useSessionActions();
  const userId = useSession((state) => state.user?.id ?? null);

  useEffect(() => bindAppStateLifecycle({ service: realtime }), [realtime]);

  // Rôle promu ou refusé : relecture de /auth/me, qui réaiguille la navigation.
  useChannelEvent(userId ? channels.user(userId) : null, 'RoleUpgradeDecision', () => {
    void restore();
  });

  return null;
}
