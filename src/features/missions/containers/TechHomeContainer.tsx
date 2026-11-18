import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import {
  isActionable,
  useAcceptProposal,
  useActiveMission,
  useReceivedProposals,
  useRefuseProposal,
  type ActiveMission,
  type ReceivedProposal,
} from '@/features/matching';
import { useTechnicianStats } from '@/features/profile';
import { formatRating } from '@/shared/format';
import { useNow } from '@/shared/hooks';
import { QueryGate, useToast } from '@/shared/ui';

import { TechHomeView, type AgendaSlot, type IncomingRequest } from '../ui/TechHomeView';

const HTTP_GONE = 410;
/** Fréquence de réévaluation des délais d'expiration. */
const CLOCK_INTERVAL_MS = 30 * 1000;

export function toIncoming(proposal: ReceivedProposal, fallback: string): IncomingRequest {
  return {
    id: proposal.id,
    client: proposal.request?.title ?? fallback,
    category: proposal.request?.category?.name ?? '',
    when: proposal.request?.address?.city ?? proposal.request?.address?.address ?? '',
    distanceKm: null,
    etaMin: null,
    price: proposal.price,
  };
}

export function toAgenda(mission: ActiveMission | null | undefined, label: string): AgendaSlot[] {
  if (!mission) return [];
  return [
    {
      id: mission.job?.id ?? mission.request.id,
      time: label,
      title: mission.request.title,
      detail: [mission.client?.name, mission.address?.city].filter(Boolean).join(' · '),
      state: 'active',
    },
  ];
}

export interface TechHomeContainerProps {
  onNotifications: () => void;
  onOpenMission: () => void;
  onPlanning: () => void;
}

/** Onglet « Missions » du technicien : propositions reçues, mission en cours, mois écoulé. */
export function TechHomeContainer(props: TechHomeContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const name = useSession((state) => state.user?.name ?? '');
  const proposals = useReceivedProposals();
  const mission = useActiveMission();
  const stats = useTechnicianStats();
  const accept = useAcceptProposal();
  const refuse = useRefuseProposal();
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const now = useNow(CLOCK_INTERVAL_MS);

  const decide = async (id: string, decision: 'accept' | 'refuse') => {
    setRespondingId(id);
    try {
      await (decision === 'accept' ? accept : refuse).mutateAsync(id);
      toast.show({
        kind: 'success',
        title: t(decision === 'accept' ? 'missions:techHub.accepted' : 'missions:techHub.declined'),
      });
      if (decision === 'accept') props.onOpenMission();
    } catch (error) {
      const appError = normalizeError(error);
      toast.show({
        kind: 'error',
        title:
          appError.status === HTTP_GONE && appError.serverMessage
            ? appError.serverMessage
            : describeError(appError, t),
      });
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <QueryGate queries={[proposals, mission]} withTabBar>
      {() => {
        const pending = (proposals.data ?? []).filter((proposal) => isActionable(proposal, now));
        const rate = stats.data?.completion_rate;
        return (
          <TechHomeView
            firstName={name.split(' ')[0] ?? name}
            online
            today={{
              earnings: stats.data?.monthly_earnings ?? 0,
              missions: stats.data?.missions_completed ?? 0,
              rating: stats.data?.rating != null ? formatRating(stats.data.rating) : '—',
              time: rate != null ? `${Math.round(rate)} %` : '—',
            }}
            periodLabel={t('missions:techHub.thisMonth')}
            timeLabel={t('missions:techHub.completion')}
            incoming={pending.map((proposal) =>
              toIncoming(proposal, t('missions:techHub.activeMission')),
            )}
            agenda={toAgenda(mission.data, t('missions:techHome.ongoing'))}
            respondingId={respondingId}
            onNotifications={props.onNotifications}
            onAccept={(request) => void decide(request.id, 'accept')}
            onDecline={(request) => void decide(request.id, 'refuse')}
            onOpenSlot={props.onOpenMission}
            onPlanning={props.onPlanning}
          />
        );
      }}
    </QueryGate>
  );
}
