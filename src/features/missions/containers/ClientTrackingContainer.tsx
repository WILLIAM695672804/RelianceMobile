import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { holdForRequest, useHolds } from '@/features/wallet';
import { formatAmount } from '@/shared/format';
import { BackButton, EmptyState, QueryGate, Screen } from '@/shared/ui';

import {
  useClientMission,
  useJobSync,
  useJobTracking,
  useTechnicianPosition,
} from '../hooks/useMissions';
import { JOB_TIMELINE, timelineIndexOf } from '../model/jobStatus';
import type { ClientMission } from '../schemas/missionSchemas';
import { TrackingView, type TrackingPhase } from '../ui/TrackingView';

type Translate = (key: string, options?: Record<string, unknown>) => string;

/**
 * Frise du suivi : les étapes de la mission, marquées faites, en cours ou à venir. Une mission
 * sans statut (proposition acceptée, travail non créé) est à sa première étape.
 */
export function trackingPhases(status: string | null, t: Translate): TrackingPhase[] {
  const current = status ? Math.max(0, timelineIndexOf(status)) : 0;
  return JOB_TIMELINE.map((step, index) => ({
    label: t(`missions:status.${step}`),
    detail: t(`missions:track.details.${step}`),
    state:
      status === 'completed' || index < current ? 'done' : index === current ? 'active' : 'todo',
  }));
}

/** Référence courte d'une demande (« #D9416DA5 »). */
export function shortReference(requestId: string): string {
  return `#${requestId.slice(0, 8).toUpperCase()}`;
}

export interface ClientTrackingContainerProps {
  onBack: () => void;
  onChat: (technicianId: string, subject: string) => void;
  onOpenQuotes: (requestId: string) => void;
  onOpenQuality: (requestId: string, technicianId: string) => void;
}

/** Suivi client de l'intervention en cours, synchronisé par le temps réel. */
export function ClientTrackingContainer(props: ClientTrackingContainerProps) {
  const { t } = useTranslation();
  const mission = useClientMission();
  const jobId = mission.data?.job_id ?? null;
  const tracking = useJobTracking(jobId);
  const holds = useHolds();
  const position = useTechnicianPosition();
  useJobSync(jobId);

  const render = (current: ClientMission) => {
    const status = tracking.data?.status ?? null;
    const technician = current.technician;
    // Le montant réellement gelé (devis accepté) prime sur le prix de la proposition.
    const hold = holds.data ? holdForRequest(holds.data, current.request.id) : null;
    const price = hold?.amount ?? current.proposal?.price ?? null;
    const requestId = current.request.id;
    const completed = status === 'completed';
    return (
      <TrackingView
        technician={{
          name: technician?.name ?? t('missions:track.unassigned'),
          skill: current.request.category ?? current.request.title,
        }}
        reference={shortReference(requestId)}
        phases={trackingPhases(status, t)}
        eta={null}
        technicianAt={
          position.data
            ? { latitude: position.data.latitude, longitude: position.data.longitude }
            : null
        }
        destination={
          current.address?.latitude != null && current.address.longitude != null
            ? { latitude: current.address.latitude, longitude: current.address.longitude }
            : null
        }
        escrow={
          price != null
            ? {
                amount: price,
                progress: completed ? 1 : 0,
                spent: t(completed ? 'missions:track.releasable' : 'missions:track.held'),
                remaining: formatAmount(price),
              }
            : null
        }
        primaryAction={
          completed
            ? {
                label: t('missions:tracking.quality'),
                onPress: () => props.onOpenQuality(requestId, technician?.id ?? ''),
              }
            : status === 'arrived' || status === 'in_progress'
              ? {
                  label: t('missions:tracking.quotes'),
                  onPress: () => props.onOpenQuotes(requestId),
                }
              : null
        }
        onBack={props.onBack}
        onChat={() => technician && props.onChat(technician.id, current.request.title)}
        onCall={
          technician?.phone ? () => void Linking.openURL(`tel:${technician.phone}`) : undefined
        }
      />
    );
  };

  return (
    <QueryGate queries={[mission]}>
      {() =>
        mission.data ? (
          render(mission.data)
        ) : (
          <Screen testID="suivi-vide">
            <BackButton onPress={props.onBack} />
            <EmptyState
              icon="clock"
              title={t('missions:tracking.none')}
              message={t('missions:tracking.noneHint')}
            />
          </Screen>
        )
      }
    </QueryGate>
  );
}
