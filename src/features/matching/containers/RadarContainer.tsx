import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useTechnicianIdentity } from '@/features/profile';
import { useNow } from '@/shared/hooks';
import { QueryGate, useToast } from '@/shared/ui';

import { useAcceptProposal, useReceivedProposals, useRefuseProposal } from '../hooks/useProposals';
import { expiryState, isActionable } from '../model/proposalExpiry';
import type { ReceivedProposal } from '../schemas/matchingSchemas';
import { RadarView, type RadarProposal } from '../ui/RadarView';

/** Rayon retenu lorsque le technicien n'a pas déclaré de zone. */
const DEFAULT_RADIUS_KM = 10;
/** Réévaluation des délais d'expiration. */
const CLOCK_INTERVAL_MS = 30 * 1000;

/** Proposition reçue au format du radar ; le délai restant est formulé en heures et minutes. */
export function toRadarProposal(
  proposal: ReceivedProposal,
  now: number,
  labels: { fallback: string },
): RadarProposal {
  const expiry = expiryState(proposal.expires_at, now);
  const meta = proposal.request?.address?.meta;
  return {
    id: proposal.id,
    title: proposal.request?.title ?? labels.fallback,
    category: proposal.request?.category?.name ?? '',
    place: proposal.request?.address?.city ?? '',
    price: proposal.price,
    expiresIn:
      expiry?.status === 'active'
        ? expiry.hours > 0
          ? `${expiry.hours} h ${String(expiry.minutes).padStart(2, '0')}`
          : `${expiry.minutes} min`
        : null,
    coordinates:
      meta?.latitude != null && meta.longitude != null
        ? { latitude: meta.latitude, longitude: meta.longitude }
        : null,
  };
}

export interface RadarContainerProps {
  onBack: () => void;
  /** Proposition acceptée : ouverture de la mission. */
  onAccepted: () => void;
}

/**
 * Radar en direct : propositions en attente, actualisées par le canal `proposals.{id}`
 * (`ProposalCreated`), sur la carte de la zone d'intervention.
 */
export function RadarContainer({ onBack, onAccepted }: RadarContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const now = useNow(CLOCK_INTERVAL_MS);
  const proposals = useReceivedProposals();
  const identity = useTechnicianIdentity();
  const accept = useAcceptProposal();
  const refuse = useRefuseProposal();
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const decide = async (id: string, decision: 'accept' | 'refuse') => {
    setRespondingId(id);
    try {
      await (decision === 'accept' ? accept : refuse).mutateAsync(id);
      toast.show({
        kind: 'success',
        title: t(decision === 'accept' ? 'matching:radar.accepted' : 'matching:radar.refused'),
      });
      if (decision === 'accept') onAccepted();
    } catch (error) {
      toast.show({ kind: 'error', title: describeError(normalizeError(error), t) });
    } finally {
      setRespondingId(null);
    }
  };

  const perimeter = identity.data?.service_perimeter;
  const zone =
    perimeter?.latitude != null && perimeter.longitude != null
      ? {
          center: { latitude: perimeter.latitude, longitude: perimeter.longitude },
          radiusKm: perimeter.radius ?? DEFAULT_RADIUS_KM,
        }
      : null;

  return (
    <QueryGate queries={[proposals]}>
      {() => (
        <RadarView
          zone={zone}
          proposals={(proposals.data ?? [])
            .filter((proposal) => isActionable(proposal, now))
            .map((proposal) =>
              toRadarProposal(proposal, now, { fallback: t('matching:radar.fallbackTitle') }),
            )}
          respondingId={respondingId}
          onAccept={(proposal) => void decide(proposal.id, 'accept')}
          onRefuse={(proposal) => void decide(proposal.id, 'refuse')}
          onBack={onBack}
        />
      )}
    </QueryGate>
  );
}
