import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import type { TechSummary } from '@/shared/model';
import { useToast } from '@/shared/ui';

import { useMatchResults, useSelectTechnician } from '../hooks/useMatching';
import type { MatchedTechnician } from '../schemas/matchingSchemas';
import { MatchingView } from '../ui/MatchingView';

/** Technicien rapproché réduit au résumé de la refonte ; le tarif est celui de sa première compétence. */
export function matchedToSummary(technician: MatchedTechnician): TechSummary {
  const skill = technician.skills[0];
  return {
    id: technician.id,
    name: technician.name,
    skill: skill?.name ?? '',
    rating: technician.rating ?? null,
    jobs: technician.num_reviews ?? null,
    distanceKm: technician.distance_km ?? null,
    etaMin: null,
    price: skill?.hourly_rate ?? null,
    verified: Boolean(technician.verified),
  };
}

export interface MatchingContainerProps {
  requestId: string;
  /** Proposition envoyée au technicien choisi. */
  onSent: () => void;
  /** Profil et offre détaillée ; aussi retenu lorsque le tarif est inconnu. */
  onViewProfile: (technicianId: string) => void;
  onClose: () => void;
}

/**
 * Rapprochement : « Choisir » envoie la proposition au tarif affiché ; sans tarif connu, le
 * client passe par la fiche du technicien pour formuler son offre.
 */
export function MatchingContainer(props: MatchingContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const matches = useMatchResults(props.requestId);
  const select = useSelectTechnician(props.requestId);
  const [choosingId, setChoosingId] = useState<string | null>(null);

  const choose = async (tech: TechSummary) => {
    if (tech.price == null) {
      props.onViewProfile(tech.id);
      return;
    }
    setChoosingId(tech.id);
    try {
      await select.mutateAsync({ technicianId: tech.id, price: tech.price, message: null });
      toast.show({ kind: 'success', title: t('matching:live.sent', { name: tech.name }) });
      props.onSent();
    } catch (error) {
      const appError = normalizeError(error);
      toast.show({ kind: 'error', title: describeError(appError, t) });
    } finally {
      setChoosingId(null);
    }
  };

  return (
    <MatchingView
      status={matches.isPending ? 'searching' : matches.isError ? 'error' : 'ready'}
      technicians={(matches.data ?? []).map(matchedToSummary)}
      errorKind={matches.isError ? normalizeError(matches.error).kind : undefined}
      choosingId={choosingId}
      onChoose={(tech) => void choose(tech)}
      onViewProfile={(tech) => props.onViewProfile(tech.id)}
      onRetry={() => void matches.refetch()}
      onClose={props.onClose}
    />
  );
}
