import { useEffect } from 'react';

import { bindAppStateLifecycle, channels, useChannelEvent, useRealtime } from '@/core/realtime';
import { useSession, useSessionActions } from '@/core/session';
import { useQuotesSync } from '@/features/billing';
import { useKycStatusSync } from '@/features/kyc';
import { useNotificationsSync } from '@/features/notifications';
import { useProposalsSync } from '@/features/matching';

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

  // Décision sur un justificatif : relecture des documents, même hors de l'écran KYC.
  useKycStatusSync();

  // Propositions reçues, acceptées ou refusées : relecture des propositions et des demandes.
  useProposalsSync();

  // Devis reçu ou facture émise : relecture de la facturation.
  useQuotesSync();

  // Notification reçue : relecture de la liste et du compteur.
  useNotificationsSync();

  return null;
}
